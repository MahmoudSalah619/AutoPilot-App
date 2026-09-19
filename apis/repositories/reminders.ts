import dayjs from 'dayjs';

import { isLive, TABLES } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { ServiceReminder } from '@/@types/models';
import { resolveReminderStatus } from '@/utils/domain';
import {
  assertOk,
  byDateAsc,
  compact,
  RepositoryError,
  toDateOnly,
  toDomainId,
  toRowId,
  unwrapRaw,
} from './helpers';

export type ReminderDraft = Omit<ServiceReminder, 'id' | 'createdAt' | 'status' | 'isActive'> &
  Partial<Pick<ServiceReminder, 'isActive'>>;

export interface ReminderFilter {
  vehicleId?: string;
  status?: ServiceReminder['status'];
  /** Includes completed reminders, which are hidden by default. */
  includeCompleted?: boolean;
}

/* ── Live-schema mapping ──────────────────────────────────────────────────── */

/**
 * A row of `public.service_reminders`.
 *
 * The table is date-only: there is no service type, trigger, due odometer or
 * recurrence. `notes` is the single free-text column, so the reminder's title
 * is stored there — which is why the model's own `notes` field does not
 * survive a round trip. Distance-triggered and repeating reminders need the
 * migration before they work.
 */
interface ReminderRow {
  id: number;
  vehicle_id: number;
  date: string;
  notes: string | null;
  is_completed: boolean | null;
  completed_at: string | null;
  created_at: string;
}

const REMINDER_COLUMNS = 'id, vehicle_id, date, notes, is_completed, completed_at, created_at';

function fromReminderRow(row: ReminderRow): ServiceReminder {
  return {
    id: toDomainId(row.id),
    vehicleId: toDomainId(row.vehicle_id),
    title: row.notes ?? '',
    dueDate: row.date,
    isActive: !row.is_completed,
    createdAt: row.created_at,
    // Unbacked by the current schema; fixed so the shape stays complete.
    serviceType: 'other',
    trigger: 'date',
    status: 'active',
  };
}

function toReminderRow(draft: Partial<ReminderDraft>): Record<string, unknown> {
  return compact({
    vehicle_id: draft.vehicleId !== undefined ? toRowId(draft.vehicleId) : undefined,
    date: draft.dueDate !== undefined ? toDateOnly(draft.dueDate) : undefined,
    notes: draft.title,
    is_completed: draft.isActive !== undefined ? !draft.isActive : undefined,
  });
}

/** Current odometer for the reminder's vehicle, used to resolve distance triggers. */
function odometerFor(vehicleId: string, vehicles: { id: string; odometer: number }[]): number {
  return vehicles.find((vehicle) => vehicle.id === vehicleId)?.odometer ?? 0;
}

/* ── Queries ──────────────────────────────────────────────────────────────── */

export async function listReminders(filter?: ReminderFilter): Promise<ServiceReminder[]> {
  if (!isLive('reminders')) {
    const resolved = db.reminders
      .filter((reminder) => !filter?.vehicleId || reminder.vehicleId === filter.vehicleId)
      .map((reminder) => ({
        ...reminder,
        status: resolveReminderStatus(reminder, odometerFor(reminder.vehicleId, db.vehicles)),
      }))
      .filter((reminder) => filter?.includeCompleted || reminder.isActive)
      .filter((reminder) => !filter?.status || reminder.status === filter.status);

    return delay(byDateAsc(resolved, 'dueDate'));
  }

  let query = supabase.from(TABLES.serviceReminders).select(REMINDER_COLUMNS);

  if (filter?.vehicleId) query = query.eq('vehicle_id', toRowId(filter.vehicleId));
  if (!filter?.includeCompleted) query = query.or('is_completed.is.null,is_completed.eq.false');

  const rows = unwrapRaw<ReminderRow[]>(await query.order('date', { ascending: true }));

  const vehicles = unwrapRaw<{ id: number; odometer: number | null }[]>(
    await supabase.from(TABLES.vehicles).select('id, odometer')
  ).map((vehicle) => ({ id: toDomainId(vehicle.id), odometer: Number(vehicle.odometer ?? 0) }));

  return rows
    .map(fromReminderRow)
    .map((reminder) => ({
      ...reminder,
      status: resolveReminderStatus(reminder, odometerFor(reminder.vehicleId, vehicles)),
    }))
    .filter((reminder) => !filter?.status || reminder.status === filter.status);
}

export async function createReminder(draft: ReminderDraft): Promise<ServiceReminder> {
  if (!isLive('reminders')) {
    const reminder: ServiceReminder = {
      ...draft,
      id: mockId('rem'),
      isActive: draft.isActive ?? true,
      status: 'active',
      createdAt: dayjs().toISOString(),
    };

    reminder.status = resolveReminderStatus(reminder, odometerFor(reminder.vehicleId, db.vehicles));

    db.reminders.unshift(reminder);
    return delay(reminder);
  }

  if (!draft.dueDate) {
    // `date` is `not null`, and a distance-only reminder has nothing to put
    // there until the migration adds `due_odometer`.
    throw new RepositoryError('reminders.errors.dueDateRequired', 400);
  }

  const row = unwrapRaw<ReminderRow>(
    await supabase
      .from(TABLES.serviceReminders)
      .insert({ ...toReminderRow(draft), is_completed: !(draft.isActive ?? true) })
      .select(REMINDER_COLUMNS)
      .single()
  );

  return fromReminderRow(row);
}

export async function updateReminder(
  id: string,
  patch: Partial<ReminderDraft>
): Promise<ServiceReminder> {
  if (!isLive('reminders')) {
    const index = db.reminders.findIndex((reminder) => reminder.id === id);
    if (index === -1) throw new RepositoryError('Reminder not found', 404);

    db.reminders[index] = { ...db.reminders[index], ...patch };
    db.reminders[index].status = resolveReminderStatus(
      db.reminders[index],
      odometerFor(db.reminders[index].vehicleId, db.vehicles)
    );

    return delay(db.reminders[index]);
  }

  const row = unwrapRaw<ReminderRow>(
    await supabase
      .from(TABLES.serviceReminders)
      .update(toReminderRow(patch))
      .eq('id', toRowId(id))
      .select(REMINDER_COLUMNS)
      .single()
  );

  return fromReminderRow(row);
}

/**
 * Marks a reminder done.
 *
 * In mock mode a recurring reminder rolls forward to its next occurrence
 * instead of being archived. The live table has no recurrence columns, so
 * against Supabase every completion archives — the schedule has to be
 * re-created by hand until the migration lands.
 */
export async function completeReminder(id: string): Promise<ServiceReminder> {
  if (isLive('reminders')) {
    const row = unwrapRaw<ReminderRow>(
      await supabase
        .from(TABLES.serviceReminders)
        .update({ is_completed: true, completed_at: dayjs().format('YYYY-MM-DD') })
        .eq('id', toRowId(id))
        .select(REMINDER_COLUMNS)
        .single()
    );

    return { ...fromReminderRow(row), status: 'completed' };
  }

  const existing = db.reminders.find((reminder) => reminder.id === id);
  if (!existing) throw new RepositoryError('Reminder not found', 404);

  const isRecurring = Boolean(existing.repeatEveryMonths || existing.repeatEveryKm);

  if (!isRecurring) {
    return updateReminder(id, { isActive: false });
  }

  return updateReminder(id, {
    dueDate: existing.repeatEveryMonths
      ? dayjs().add(existing.repeatEveryMonths, 'month').toISOString()
      : existing.dueDate,
    dueOdometer:
      existing.repeatEveryKm && existing.dueOdometer != null
        ? existing.dueOdometer + existing.repeatEveryKm
        : existing.dueOdometer,
  });
}

export async function deleteReminder(id: string): Promise<string> {
  if (!isLive('reminders')) {
    db.reminders = db.reminders.filter((reminder) => reminder.id !== id);
    return delay(id);
  }

  assertOk(await supabase.from(TABLES.serviceReminders).delete().eq('id', toRowId(id)));

  return id;
}
