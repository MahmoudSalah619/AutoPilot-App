import dayjs from 'dayjs';

import { TABLES, USE_MOCK_DATA } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { ServiceReminder } from '@/@types/models';
import { resolveReminderStatus } from '@/utils/domain';
import { byDateAsc, RepositoryError, toRow, unwrap } from './helpers';

export type ReminderDraft = Omit<ServiceReminder, 'id' | 'createdAt' | 'status' | 'isActive'> &
  Partial<Pick<ServiceReminder, 'isActive'>>;

export interface ReminderFilter {
  vehicleId?: string;
  status?: ServiceReminder['status'];
  /** Includes completed reminders, which are hidden by default. */
  includeCompleted?: boolean;
}

/** Current odometer for the reminder's vehicle, used to resolve distance triggers. */
function odometerFor(vehicleId: string, vehicles: { id: string; odometer: number }[]): number {
  return vehicles.find((vehicle) => vehicle.id === vehicleId)?.odometer ?? 0;
}

export async function listReminders(filter?: ReminderFilter): Promise<ServiceReminder[]> {
  if (USE_MOCK_DATA) {
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

  let query = supabase.from(TABLES.serviceReminders).select('*');

  if (filter?.vehicleId) query = query.eq('vehicle_id', filter.vehicleId);
  if (!filter?.includeCompleted) query = query.eq('is_active', true);

  const reminders = unwrap<ServiceReminder[]>(await query.order('due_date', { ascending: true }));

  const vehicles = unwrap<{ id: string; odometer: number }[]>(
    await supabase.from(TABLES.vehicles).select('id, odometer')
  );

  return reminders
    .map((reminder) => ({
      ...reminder,
      status: resolveReminderStatus(reminder, odometerFor(reminder.vehicleId, vehicles)),
    }))
    .filter((reminder) => !filter?.status || reminder.status === filter.status);
}

export async function createReminder(draft: ReminderDraft): Promise<ServiceReminder> {
  if (USE_MOCK_DATA) {
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

  return unwrap<ServiceReminder>(
    await supabase
      .from(TABLES.serviceReminders)
      .insert(toRow({ ...draft, isActive: draft.isActive ?? true }))
      .select()
      .single()
  );
}

export async function updateReminder(
  id: string,
  patch: Partial<ReminderDraft>
): Promise<ServiceReminder> {
  if (USE_MOCK_DATA) {
    const index = db.reminders.findIndex((reminder) => reminder.id === id);
    if (index === -1) throw new RepositoryError('Reminder not found', 404);

    db.reminders[index] = { ...db.reminders[index], ...patch };
    db.reminders[index].status = resolveReminderStatus(
      db.reminders[index],
      odometerFor(db.reminders[index].vehicleId, db.vehicles)
    );

    return delay(db.reminders[index]);
  }

  return unwrap<ServiceReminder>(
    await supabase.from(TABLES.serviceReminders).update(toRow(patch)).eq('id', id).select().single()
  );
}

/**
 * Marks a reminder done.
 *
 * A recurring reminder rolls forward to its next occurrence rather than being
 * archived, so the schedule keeps running without the user re-creating it.
 */
export async function completeReminder(id: string): Promise<ServiceReminder> {
  const existing = USE_MOCK_DATA
    ? db.reminders.find((reminder) => reminder.id === id)
    : unwrap<ServiceReminder>(
        await supabase.from(TABLES.serviceReminders).select('*').eq('id', id).single()
      );

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
  if (USE_MOCK_DATA) {
    db.reminders = db.reminders.filter((reminder) => reminder.id !== id);
    return delay(id);
  }

  const { error } = await supabase.from(TABLES.serviceReminders).delete().eq('id', id);
  if (error) throw new RepositoryError(error.message);

  return id;
}
