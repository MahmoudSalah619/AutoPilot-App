import dayjs from 'dayjs';

import { isLive, TABLES } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { FuelEntry, FuelStatistics } from '@/@types/models';
import { calculateFuelStatistics } from '@/utils/domain';
import {
  assertOk,
  byDateDesc,
  compact,
  RepositoryError,
  toDateOnly,
  toDomainId,
  toRowId,
  unwrapRaw,
} from './helpers';
import { getVehicle, updateOdometer } from './vehicles';

export type FuelEntryDraft = Omit<FuelEntry, 'id' | 'createdAt' | 'distanceKm'> & {
  /** Optional: derived from the previous entry's odometer when omitted. */
  distanceKm?: number;
};

export interface FuelFilter {
  vehicleId?: string;
  from?: string;
  to?: string;
}

export interface FuelListResult {
  entries: FuelEntry[];
  statistics: FuelStatistics;
}

/* ── Live-schema mapping ──────────────────────────────────────────────────── */

/**
 * A row of `public.gas_consumption`, the live fuel table.
 *
 * The odometer, cost, station and full-tank columns come from
 * `apis/migrations/002_fuel.sql`; the table was distance-and-volume only
 * before it. The table's own `efficiency` column is a generated
 * `(km / L) / 1000`, which is off by three orders of magnitude, so it is
 * ignored in favour of the app's own calculation.
 */
interface FuelRow {
  id: number;
  vehicle_id: number;
  date: string;
  odometer: number | null;
  kilometers_driven: number;
  liters_consumed: number;
  price_per_liter: number | null;
  total_cost: number | null;
  currency: string | null;
  station_name: string | null;
  is_full_tank: boolean | null;
  notes: string | null;
  created_at: string;
}

const FUEL_COLUMNS =
  'id, vehicle_id, date, odometer, kilometers_driven, liters_consumed, price_per_liter, total_cost, currency, station_name, is_full_tank, notes, created_at';

function fromFuelRow(row: FuelRow): FuelEntry {
  return {
    id: toDomainId(row.id),
    vehicleId: toDomainId(row.vehicle_id),
    date: row.date,
    odometer: Number(row.odometer ?? 0),
    distanceKm: Number(row.kilometers_driven ?? 0),
    liters: Number(row.liters_consumed ?? 0),
    pricePerLiter: row.price_per_liter != null ? Number(row.price_per_liter) : undefined,
    totalCost: row.total_cost != null ? Number(row.total_cost) : undefined,
    currency: (row.currency as FuelEntry['currency']) ?? undefined,
    stationName: row.station_name ?? undefined,
    isFullTank: row.is_full_tank ?? true,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function toFuelRow(draft: Partial<FuelEntryDraft>): Record<string, unknown> {
  return compact({
    vehicle_id: draft.vehicleId !== undefined ? toRowId(draft.vehicleId) : undefined,
    date: draft.date !== undefined ? toDateOnly(draft.date) : undefined,
    odometer: draft.odometer,
    kilometers_driven: draft.distanceKm,
    liters_consumed: draft.liters,
    price_per_liter: draft.pricePerLiter,
    total_cost: draft.totalCost,
    currency: draft.currency,
    station_name: draft.stationName,
    is_full_tank: draft.isFullTank,
    notes: draft.notes,
  });
}

/* ── Mock helpers ─────────────────────────────────────────────────────────── */

function applyFilter(entries: FuelEntry[], filter?: FuelFilter) {
  if (!filter) return entries;

  return entries.filter((entry) => {
    if (filter.vehicleId && entry.vehicleId !== filter.vehicleId) return false;
    if (filter.from && dayjs(entry.date).isBefore(dayjs(filter.from), 'day')) return false;
    if (filter.to && dayjs(entry.date).isAfter(dayjs(filter.to), 'day')) return false;

    return true;
  });
}

/**
 * Derives distance from the preceding fill-up when the caller did not supply
 * it — drivers read the odometer, not the trip meter.
 */
function deriveDistance(draft: FuelEntryDraft, previous?: FuelEntry): number {
  if (draft.distanceKm != null && draft.distanceKm > 0) return draft.distanceKm;
  if (!previous) return 0;

  return Math.max(0, draft.odometer - previous.odometer);
}

/**
 * Distance for a live fill-up: this odometer reading minus the one on the
 * fill-up before it.
 *
 * The first fill-up has nothing to subtract from and records zero, the same
 * as the mock branch — `calculateFuelStatistics` leaves zero-distance entries
 * out of the efficiency figures, so it cannot skew the average.
 */
async function deriveLiveDistance(
  draft: Pick<FuelEntryDraft, 'vehicleId' | 'date' | 'odometer' | 'distanceKm'>,
  /** The entry being edited, so it is not taken for its own predecessor. */
  excludeId?: string
): Promise<number> {
  if (draft.distanceKm != null && draft.distanceKm > 0) return draft.distanceKm;

  let query = supabase
    .from(TABLES.gasConsumption)
    .select('odometer')
    .eq('vehicle_id', toRowId(draft.vehicleId))
    .lte('date', toDateOnly(draft.date))
    .not('odometer', 'is', null);

  if (excludeId) query = query.neq('id', toRowId(excludeId));

  const previous = unwrapRaw<{ odometer: number | null }[]>(
    await query
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
  )[0];

  if (previous?.odometer == null) return 0;

  return Math.max(0, draft.odometer - Number(previous.odometer));
}

/**
 * A fill-up is also an odometer reading, so a higher one moves the vehicle
 * forward. Best effort: a back-dated entry reads lower than the vehicle and is
 * rejected by `updateOdometer`, which must not fail the fill-up itself.
 */
async function advanceVehicleOdometer(vehicleId: string, odometer: number): Promise<void> {
  try {
    const vehicle = await getVehicle(vehicleId);
    if (odometer > vehicle.odometer) await updateOdometer(vehicleId, odometer);
  } catch {
    // The fill-up is saved either way; the odometer can be corrected on Home.
  }
}

/* ── Queries ──────────────────────────────────────────────────────────────── */

/**
 * Fuel history plus its aggregate statistics.
 *
 * Statistics are computed over the *filtered* set, so narrowing the date range
 * also narrows the averages — which is what makes the filter useful.
 */
export async function listFuelEntries(filter?: FuelFilter): Promise<FuelListResult> {
  if (!isLive('fuel')) {
    const entries = byDateDesc(applyFilter(db.fuelEntries, filter), 'date');
    return delay({ entries, statistics: calculateFuelStatistics(entries) });
  }

  let query = supabase.from(TABLES.gasConsumption).select(FUEL_COLUMNS);

  if (filter?.vehicleId) query = query.eq('vehicle_id', toRowId(filter.vehicleId));
  if (filter?.from) query = query.gte('date', toDateOnly(filter.from));
  if (filter?.to) query = query.lte('date', toDateOnly(filter.to));

  const entries = unwrapRaw<FuelRow[]>(await query.order('date', { ascending: false })).map(
    fromFuelRow
  );

  return { entries, statistics: calculateFuelStatistics(entries) };
}

export async function createFuelEntry(draft: FuelEntryDraft): Promise<FuelEntry> {
  if (!isLive('fuel')) {
    const previous = byDateDesc(
      db.fuelEntries.filter(
        (entry) =>
          entry.vehicleId === draft.vehicleId &&
          dayjs(entry.date).isBefore(dayjs(draft.date), 'day')
      ),
      'date'
    )[0];

    const entry: FuelEntry = {
      ...draft,
      distanceKm: deriveDistance(draft, previous),
      totalCost:
        draft.totalCost ??
        (draft.pricePerLiter ? Number((draft.pricePerLiter * draft.liters).toFixed(2)) : undefined),
      id: mockId('fuel'),
      createdAt: dayjs().toISOString(),
    };

    db.fuelEntries.unshift(entry);
    await advanceVehicleOdometer(entry.vehicleId, entry.odometer);

    return delay(entry);
  }

  const distanceKm = await deriveLiveDistance(draft);

  const row = unwrapRaw<FuelRow>(
    await supabase
      .from(TABLES.gasConsumption)
      .insert(toFuelRow({ ...draft, distanceKm }))
      .select(FUEL_COLUMNS)
      .single()
  );

  await advanceVehicleOdometer(draft.vehicleId, draft.odometer);

  return fromFuelRow(row);
}

export async function updateFuelEntry(
  id: string,
  patch: Partial<FuelEntryDraft>
): Promise<FuelEntry> {
  if (!isLive('fuel')) {
    const index = db.fuelEntries.findIndex((entry) => entry.id === id);
    if (index === -1) throw new RepositoryError('Fuel entry not found', 404);

    db.fuelEntries[index] = { ...db.fuelEntries[index], ...patch } as FuelEntry;
    return delay(db.fuelEntries[index]);
  }

  // Correcting the odometer or the date changes how far the car went since
  // the fill-up before, so the stored distance is worked out again.
  const distanceKm =
    patch.vehicleId && patch.date && patch.odometer != null
      ? await deriveLiveDistance(
          { vehicleId: patch.vehicleId, date: patch.date, odometer: patch.odometer },
          id
        )
      : undefined;

  const row = unwrapRaw<FuelRow>(
    await supabase
      .from(TABLES.gasConsumption)
      .update(toFuelRow({ ...patch, distanceKm: distanceKm ?? patch.distanceKm }))
      .eq('id', toRowId(id))
      .select(FUEL_COLUMNS)
      .single()
  );

  return fromFuelRow(row);
}

export async function deleteFuelEntry(id: string): Promise<string> {
  if (!isLive('fuel')) {
    db.fuelEntries = db.fuelEntries.filter((entry) => entry.id !== id);
    return delay(id);
  }

  assertOk(await supabase.from(TABLES.gasConsumption).delete().eq('id', toRowId(id)));

  return id;
}
