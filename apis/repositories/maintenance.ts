import dayjs from 'dayjs';

import { isLive, TABLES } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { MaintenanceRecord, MaintenanceStatus } from '@/@types/models';
import { resolveMaintenanceStatus } from '@/utils/domain';
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
import { findServiceTypeId, resolveServiceTypeId, resolveServiceTypeKey } from './reference';

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

/* ── Live-schema mapping ──────────────────────────────────────────────────── */

interface MaintenanceRow {
  id: number;
  vehicle_id: number;
  service_type: number;
  date: string | null;
  odometer: number | null;
  cost: number | null;
  interval: number | null;
  notes: string | null;
  status: 'completed' | 'upcoming' | 'overdue' | null;
  created_at: string;
}

const MAINTENANCE_COLUMNS =
  'id, vehicle_id, service_type, date, odometer, cost, interval, notes, status, created_at';

/** `maintenance.status` is an enum without the app's `dueSoon` member. */
function toRowStatus(status: MaintenanceStatus): 'completed' | 'upcoming' | 'overdue' {
  return status === 'dueSoon' ? 'upcoming' : status;
}

/**
 * A service dated today or earlier has happened. Today counts: comparing with
 * "before today" left a service logged on the day it was done reading as
 * "due soon" until midnight.
 */
function isCarriedOut(date: string): boolean {
  return !dayjs(date).isAfter(dayjs(), 'day');
}

async function fromMaintenanceRow(row: MaintenanceRow): Promise<MaintenanceRecord> {
  const date = row.date ?? row.created_at;

  return {
    id: toDomainId(row.id),
    vehicleId: toDomainId(row.vehicle_id),
    serviceType: await resolveServiceTypeKey(row.service_type),
    date,
    odometer: row.odometer ?? undefined,
    cost: row.cost ?? undefined,
    intervalKm: row.interval ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    // Recomputed against today so "overdue" reflects now, not insert time.
    status: resolveMaintenanceStatus(date, isCarriedOut(date)),
  };
}

/**
 * Builds the row for an insert or update.
 *
 * `service_type` is `not null` and points at `services_types`, which ships
 * empty — so without a seeded catalogue there is no legal value to write and
 * the insert would fail on the foreign key with an opaque message. Failing
 * here says what is actually wrong.
 */
async function toMaintenanceRow(
  draft: Partial<MaintenanceDraft>,
  { requireServiceType }: { requireServiceType: boolean }
): Promise<Record<string, unknown>> {
  let serviceTypeId: number | null = null;

  if (draft.serviceType !== undefined) {
    serviceTypeId = await resolveServiceTypeId(draft.serviceType);

    if (serviceTypeId == null && requireServiceType) {
      throw new RepositoryError('maintenance.errors.serviceTypeUnavailable', 400);
    }
  }

  return compact({
    vehicle_id: draft.vehicleId !== undefined ? toRowId(draft.vehicleId) : undefined,
    service_type: serviceTypeId ?? undefined,
    date: draft.date !== undefined ? toDateOnly(draft.date) : undefined,
    odometer: draft.odometer,
    cost: draft.cost,
    interval: draft.intervalKm,
    notes: draft.notes,
  });
}

/* ── Mock helpers ─────────────────────────────────────────────────────────── */

function withStatus(record: MaintenanceRecord): MaintenanceRecord {
  return { ...record, status: resolveMaintenanceStatus(record.date, isCarriedOut(record.date)) };
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

/* ── Queries ──────────────────────────────────────────────────────────────── */

export async function listMaintenance(filter?: MaintenanceFilter): Promise<MaintenanceRecord[]> {
  if (!isLive('maintenance')) {
    const records = applyFilter(db.maintenance, filter).map(withStatus);
    return delay(byDateDesc(records, 'date'));
  }

  let query = supabase.from(TABLES.maintenance).select(MAINTENANCE_COLUMNS);

  if (filter?.vehicleId) query = query.eq('vehicle_id', toRowId(filter.vehicleId));
  if (filter?.from) query = query.gte('date', toDateOnly(filter.from));
  if (filter?.to) query = query.lte('date', toDateOnly(filter.to));

  if (filter?.serviceType) {
    // Strict lookup: a service the catalogue has no row for must match
    // nothing, rather than falling back to "Other" and returning every
    // record filed under it.
    const serviceTypeId = await findServiceTypeId(filter.serviceType);
    if (serviceTypeId == null) return [];
    query = query.eq('service_type', serviceTypeId);
  }

  const rows = unwrapRaw<MaintenanceRow[]>(await query.order('date', { ascending: false }));

  return Promise.all(rows.map(fromMaintenanceRow));
}

export async function getMaintenanceRecord(id: string): Promise<MaintenanceRecord> {
  if (!isLive('maintenance')) {
    const found = db.maintenance.find((record) => record.id === id);
    if (!found) throw new RepositoryError('Maintenance record not found', 404);
    return delay(withStatus(found));
  }

  const row = unwrapRaw<MaintenanceRow>(
    await supabase
      .from(TABLES.maintenance)
      .select(MAINTENANCE_COLUMNS)
      .eq('id', toRowId(id))
      .single()
  );

  return fromMaintenanceRow(row);
}

export async function createMaintenance(draft: MaintenanceDraft): Promise<MaintenanceRecord> {
  const { isCompleted, ...rest } = draft;
  const status = resolveMaintenanceStatus(rest.date, isCompleted);

  if (!isLive('maintenance')) {
    const record: MaintenanceRecord = {
      ...rest,
      id: mockId('mnt'),
      status,
      createdAt: dayjs().toISOString(),
    };

    db.maintenance.unshift(record);
    return delay(record);
  }

  const row = unwrapRaw<MaintenanceRow>(
    await supabase
      .from(TABLES.maintenance)
      .insert({
        ...(await toMaintenanceRow(rest, { requireServiceType: true })),
        // `odometer` is `not null` with no default.
        odometer: rest.odometer ?? 0,
        status: toRowStatus(status),
      })
      .select(MAINTENANCE_COLUMNS)
      .single()
  );

  return fromMaintenanceRow(row);
}

export async function updateMaintenance(
  id: string,
  patch: Partial<MaintenanceDraft>
): Promise<MaintenanceRecord> {
  // `isCompleted` is derived on read, so it is dropped rather than stored.
  const { isCompleted: _isCompleted, ...rest } = patch;

  if (!isLive('maintenance')) {
    const index = db.maintenance.findIndex((record) => record.id === id);
    if (index === -1) throw new RepositoryError('Maintenance record not found', 404);

    db.maintenance[index] = { ...db.maintenance[index], ...rest };
    return delay(withStatus(db.maintenance[index]));
  }

  const row = unwrapRaw<MaintenanceRow>(
    await supabase
      .from(TABLES.maintenance)
      .update(await toMaintenanceRow(rest, { requireServiceType: false }))
      .eq('id', toRowId(id))
      .select(MAINTENANCE_COLUMNS)
      .single()
  );

  return fromMaintenanceRow(row);
}

export async function deleteMaintenance(id: string): Promise<string> {
  if (!isLive('maintenance')) {
    db.maintenance = db.maintenance.filter((record) => record.id !== id);
    return delay(id);
  }

  assertOk(await supabase.from(TABLES.maintenance).delete().eq('id', toRowId(id)));

  return id;
}
