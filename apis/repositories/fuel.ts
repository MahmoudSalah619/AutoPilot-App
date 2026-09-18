import dayjs from 'dayjs';

import { TABLES, USE_MOCK_DATA } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { FuelEntry, FuelStatistics } from '@/@types/models';
import { calculateFuelStatistics } from '@/utils/domain';
import { byDateDesc, RepositoryError, toRow, unwrap } from './helpers';

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
 * Fuel history plus its aggregate statistics.
 *
 * Statistics are computed over the *filtered* set, so narrowing the date range
 * also narrows the averages — which is what makes the filter useful.
 */
export async function listFuelEntries(filter?: FuelFilter): Promise<FuelListResult> {
  if (USE_MOCK_DATA) {
    const entries = byDateDesc(applyFilter(db.fuelEntries, filter), 'date');
    return delay({ entries, statistics: calculateFuelStatistics(entries) });
  }

  let query = supabase.from(TABLES.fuelEntries).select('*');

  if (filter?.vehicleId) query = query.eq('vehicle_id', filter.vehicleId);
  if (filter?.from) query = query.gte('date', filter.from);
  if (filter?.to) query = query.lte('date', filter.to);

  const entries = unwrap<FuelEntry[]>(await query.order('date', { ascending: false }));
  return { entries, statistics: calculateFuelStatistics(entries) };
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

export async function createFuelEntry(draft: FuelEntryDraft): Promise<FuelEntry> {
  if (USE_MOCK_DATA) {
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

  const previousResult = await supabase
    .from(TABLES.fuelEntries)
    .select('*')
    .eq('vehicle_id', draft.vehicleId)
    .lt('date', draft.date)
    .order('date', { ascending: false })
    .limit(1);

  const previous = unwrap<FuelEntry[]>(previousResult)[0];

  return unwrap<FuelEntry>(
    await supabase
      .from(TABLES.fuelEntries)
      .insert(
        toRow({
          ...draft,
          distanceKm: deriveDistance(draft, previous),
          totalCost:
            draft.totalCost ??
            (draft.pricePerLiter ? draft.pricePerLiter * draft.liters : undefined),
        })
      )
      .select()
      .single()
  );
}

export async function updateFuelEntry(
  id: string,
  patch: Partial<FuelEntryDraft>
): Promise<FuelEntry> {
  if (USE_MOCK_DATA) {
    const index = db.fuelEntries.findIndex((entry) => entry.id === id);
    if (index === -1) throw new RepositoryError('Fuel entry not found', 404);

    db.fuelEntries[index] = { ...db.fuelEntries[index], ...patch } as FuelEntry;
    return delay(db.fuelEntries[index]);
  }

  return unwrap<FuelEntry>(
    await supabase.from(TABLES.fuelEntries).update(toRow(patch)).eq('id', id).select().single()
  );
}

export async function deleteFuelEntry(id: string): Promise<string> {
  if (USE_MOCK_DATA) {
    db.fuelEntries = db.fuelEntries.filter((entry) => entry.id !== id);
    return delay(id);
  }

  const { error } = await supabase.from(TABLES.fuelEntries).delete().eq('id', id);
  if (error) throw new RepositoryError(error.message);

  return id;
}
