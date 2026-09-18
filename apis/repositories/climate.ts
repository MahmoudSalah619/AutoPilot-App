import dayjs from 'dayjs';

import { TABLES, USE_MOCK_DATA } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { ClimateRecord, ClimateServiceType } from '@/@types/models';
import { byDateDesc, RepositoryError, toRow, unwrap } from './helpers';

export type ClimateDraft = Omit<ClimateRecord, 'id' | 'createdAt'>;

/** Manufacturer-typical intervals for each climate service, in months. */
export const CLIMATE_INTERVALS: Record<ClimateServiceType, number> = {
  cabinFilter: 12,
  acRegas: 24,
  acInspection: 12,
  condenserClean: 12,
  ventSanitize: 12,
  heaterService: 24,
};

export interface ClimateServiceStatus {
  type: ClimateServiceType;
  intervalMonths: number;
  lastServiceDate?: string;
  nextDueDate?: string;
  /** 0 to 1 through the current interval. 1 means due now. */
  progress: number;
  isOverdue: boolean;
}

/**
 * Health of every climate service for a vehicle.
 *
 * Returns an entry for each service type — including ones never recorded —
 * so the screen can show the full maintenance picture rather than only what
 * happens to have history.
 */
export function buildClimateStatuses(records: ClimateRecord[]): ClimateServiceStatus[] {
  return (Object.keys(CLIMATE_INTERVALS) as ClimateServiceType[]).map((type) => {
    const intervalMonths = CLIMATE_INTERVALS[type];
    const last = byDateDesc(
      records.filter((record) => record.type === type),
      'date'
    )[0];

    if (!last) {
      return { type, intervalMonths, progress: 1, isOverdue: true };
    }

    const nextDue = dayjs(last.date).add(intervalMonths, 'month');
    const elapsed = dayjs().diff(dayjs(last.date), 'day');
    const total = nextDue.diff(dayjs(last.date), 'day');

    return {
      type,
      intervalMonths,
      lastServiceDate: last.date,
      nextDueDate: nextDue.toISOString(),
      progress: Math.max(0, Math.min(1, total > 0 ? elapsed / total : 1)),
      isOverdue: nextDue.isBefore(dayjs(), 'day'),
    };
  });
}

export async function listClimateRecords(vehicleId?: string): Promise<ClimateRecord[]> {
  if (USE_MOCK_DATA) {
    const records = db.climateRecords.filter(
      (record) => !vehicleId || record.vehicleId === vehicleId
    );

    return delay(byDateDesc(records, 'date'));
  }

  let query = supabase.from(TABLES.climateRecords).select('*');
  if (vehicleId) query = query.eq('vehicle_id', vehicleId);

  return unwrap<ClimateRecord[]>(await query.order('date', { ascending: false }));
}

export async function createClimateRecord(draft: ClimateDraft): Promise<ClimateRecord> {
  if (USE_MOCK_DATA) {
    const record: ClimateRecord = {
      ...draft,
      id: mockId('clm'),
      createdAt: dayjs().toISOString(),
    };

    db.climateRecords.unshift(record);
    return delay(record);
  }

  return unwrap<ClimateRecord>(
    await supabase.from(TABLES.climateRecords).insert(toRow(draft)).select().single()
  );
}

export async function deleteClimateRecord(id: string): Promise<string> {
  if (USE_MOCK_DATA) {
    db.climateRecords = db.climateRecords.filter((record) => record.id !== id);
    return delay(id);
  }

  const { error } = await supabase.from(TABLES.climateRecords).delete().eq('id', id);
  if (error) throw new RepositoryError(error.message);

  return id;
}
