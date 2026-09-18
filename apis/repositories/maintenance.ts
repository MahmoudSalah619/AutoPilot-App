import dayjs from 'dayjs';

import { TABLES, USE_MOCK_DATA } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { MaintenanceRecord } from '@/@types/models';
import { resolveMaintenanceStatus } from '@/utils/domain';
import { byDateDesc, RepositoryError, toRow, unwrap } from './helpers';

export type MaintenanceDraft = Omit<MaintenanceRecord, 'id' | 'createdAt' | 'status'> & {
  /** Explicitly marks the record as already carried out. */
  isCompleted?: boolean;
};

export interface MaintenanceFilter {
  vehicleId?: string;
  serviceType?: MaintenanceRecord['serviceType'];
  /** Inclusive ISO date bounds. */
  from?: string;
  to?: string;
}

/** Recomputes status on read so "overdue" reflects today, not insert time. */
function withStatus(record: MaintenanceRecord): MaintenanceRecord {
  const isPast = dayjs(record.date).isBefore(dayjs(), 'day');
  return { ...record, status: resolveMaintenanceStatus(record.date, isPast) };
}

function applyFilter(records: MaintenanceRecord[], filter?: MaintenanceFilter) {
  if (!filter) return records;

  return records.filter((record) => {
    if (filter.vehicleId && record.vehicleId !== filter.vehicleId) return false;
    if (filter.serviceType && record.serviceType !== filter.serviceType) return false;
    if (filter.from && dayjs(record.date).isBefore(dayjs(filter.from), 'day')) return false;
    if (filter.to && dayjs(record.date).isAfter(dayjs(filter.to), 'day')) return false;

    return true;
  });
}

export async function listMaintenance(filter?: MaintenanceFilter): Promise<MaintenanceRecord[]> {
  if (USE_MOCK_DATA) {
    const records = applyFilter(db.maintenance, filter).map(withStatus);
    return delay(byDateDesc(records, 'date'));
  }

  let query = supabase.from(TABLES.maintenanceRecords).select('*');

  if (filter?.vehicleId) query = query.eq('vehicle_id', filter.vehicleId);
  if (filter?.serviceType) query = query.eq('service_type', filter.serviceType);
  if (filter?.from) query = query.gte('date', filter.from);
  if (filter?.to) query = query.lte('date', filter.to);

  const records = unwrap<MaintenanceRecord[]>(await query.order('date', { ascending: false }));
  return records.map(withStatus);
}

export async function getMaintenanceRecord(id: string): Promise<MaintenanceRecord> {
  if (USE_MOCK_DATA) {
    const found = db.maintenance.find((record) => record.id === id);
    if (!found) throw new RepositoryError('Maintenance record not found', 404);
    return delay(withStatus(found));
  }

  const record = unwrap<MaintenanceRecord>(
    await supabase.from(TABLES.maintenanceRecords).select('*').eq('id', id).single()
  );

  return withStatus(record);
}

export async function createMaintenance(draft: MaintenanceDraft): Promise<MaintenanceRecord> {
  const { isCompleted, ...rest } = draft;

  if (USE_MOCK_DATA) {
    const record: MaintenanceRecord = {
      ...rest,
      id: mockId('mnt'),
      status: resolveMaintenanceStatus(rest.date, isCompleted),
      createdAt: dayjs().toISOString(),
    };

    db.maintenance.unshift(record);
    return delay(record);
  }

  return unwrap<MaintenanceRecord>(
    await supabase
      .from(TABLES.maintenanceRecords)
      .insert(toRow({ ...rest, status: resolveMaintenanceStatus(rest.date, isCompleted) }))
      .select()
      .single()
  );
}

export async function updateMaintenance(
  id: string,
  patch: Partial<MaintenanceDraft>
): Promise<MaintenanceRecord> {
  // `isCompleted` is derived on read, so it is dropped rather than stored.
  const { isCompleted: _isCompleted, ...rest } = patch;

  if (USE_MOCK_DATA) {
    const index = db.maintenance.findIndex((record) => record.id === id);
    if (index === -1) throw new RepositoryError('Maintenance record not found', 404);

    db.maintenance[index] = { ...db.maintenance[index], ...rest };
    return delay(withStatus(db.maintenance[index]));
  }

  return unwrap<MaintenanceRecord>(
    await supabase
      .from(TABLES.maintenanceRecords)
      .update(toRow(rest))
      .eq('id', id)
      .select()
      .single()
  );
}

export async function deleteMaintenance(id: string): Promise<string> {
  if (USE_MOCK_DATA) {
    db.maintenance = db.maintenance.filter((record) => record.id !== id);
    return delay(id);
  }

  const { error } = await supabase.from(TABLES.maintenanceRecords).delete().eq('id', id);
  if (error) throw new RepositoryError(error.message);

  return id;
}
