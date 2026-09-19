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
 * It records distance and volume only — no odometer, price, total cost,
 * station or full-tank flag — so cost tracking and the per-fill-up odometer
 * trail are dark until the migration lands. The table's own `efficiency`
 * column is a generated `(km / L) / 1000`, which is off by three orders of
 * magnitude, so it is ignored in favour of the app's own calculation.
 */
interface FuelRow {
  id: number;
  vehicle_id: number;
  date: string;
  kilometers_driven: number;
  liters_consumed: number;
  created_at: string;
}

const FUEL_COLUMNS = 'id, vehicle_id, date, kilometers_driven, liters_consumed, created_at';

function fromFuelRow(row: FuelRow): FuelEntry {
  return {
    id: toDomainId(row.id),
    vehicleId: toDomainId(row.vehicle_id),
    date: row.date,
    distanceKm: Number(row.kilometers_driven ?? 0),
    liters: Number(row.liters_consumed ?? 0),
    createdAt: row.created_at,
    // Unbacked by the current schema.
    odometer: 0,
    isFullTank: true,
  };
}

function toFuelRow(draft: Partial<FuelEntryDraft>): Record<string, unknown> {
  return compact({
    vehicle_id: draft.vehicleId !== undefined ? toRowId(draft.vehicleId) : undefined,
    date: draft.date !== undefined ? toDateOnly(draft.date) : undefined,
    kilometers_driven: draft.distanceKm,
    liters_consumed: draft.liters,
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
 * Distance for a live fill-up.
 *
 * `gas_consumption` stores no odometer, so the usual "this reading minus the
 * last one" trick has nothing to subtract from. The vehicle's own odometer is
 * the nearest stand-in; failing that the caller has to say how far they drove
 * rather than have a zero silently poison the efficiency average.
 */
async function deriveLiveDistance(draft: FuelEntryDraft): Promise<number> {
  if (draft.distanceKm != null && draft.distanceKm > 0) return draft.distanceKm;

  if (draft.odometer > 0 && draft.vehicleId) {
    const vehicle = unwrapRaw<{ odometer: number | null }>(
      await supabase
        .from(TABLES.vehicles)
        .select('odometer')
        .eq('id', toRowId(draft.vehicleId))
        .single()
    );

    const previous = Number(vehicle.odometer ?? 0);
    if (previous > 0 && draft.odometer > previous) return draft.odometer - previous;
  }

  throw new RepositoryError('fuel.errors.distanceRequired', 400);
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

  const row = unwrapRaw<FuelRow>(
    await supabase
      .from(TABLES.gasConsumption)
      .update(toFuelRow(patch))
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
