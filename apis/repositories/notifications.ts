import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

import { isLive } from '@/apis/config';
import { db, delay, mockId } from '@/apis/mock/store';
import type { AppNotification } from '@/@types/models';
import { describeDueDate } from '@/utils/date';
import {
  describeServiceDue,
  DOCUMENT_EXPIRY_WARNING_DAYS,
  DUE_SOON_DAYS,
  projectServiceDues,
} from '@/utils/domain';
import { listDocuments } from './documents';
import { RepositoryError } from './helpers';
import { listMaintenance } from './maintenance';
import { listReminders } from './reminders';
import { listVehicles } from './vehicles';

/* ── Read state ───────────────────────────────────────────────────────────── */

const READ_STORAGE_KEY = 'autopilot.read-notifications';

/** Enough to outlast anything still in the inbox without growing forever. */
const READ_HISTORY_LIMIT = 300;

/**
 * Ids this device has marked read.
 *
 * Derived notifications are not rows, so there is nowhere on the server to
 * hang an `is_read` flag. Read state is per device, the same trade the tip
 * banners make.
 */
async function getReadIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    // An unreadable list means a notification shows as unread again, which is
    // a far smaller problem than failing the inbox.
    return [];
  }
}

async function addReadIds(ids: string[]): Promise<void> {
  try {
    const next = [...new Set([...(await getReadIds()), ...ids])].slice(-READ_HISTORY_LIMIT);
    await AsyncStorage.setItem(READ_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Non-fatal: the notification reads as unread next launch.
  }
}

/* ── Derivation ───────────────────────────────────────────────────────────── */

/**
 * When a due item first earned a notification: the day it entered its warning
 * window, or the due date itself once that has passed.
 */
function raisedAt(dueDate: string, warningDays: number, isPastDue: boolean): string {
  const due = dayjs(dueDate).startOf('day');

  return (isPastDue ? due : due.subtract(warningDays, 'day')).toISOString();
}

/**
 * The inbox, computed from the user's own reminders, documents and service
 * history.
 *
 * Like every other status in the app this is derived on read rather than
 * stored: a reminder becomes a notification because time passed, not because
 * a job ran. The due date is part of the id, so rescheduling a reminder makes
 * it a new, unread notification instead of inheriting the old one's state.
 */
async function deriveNotifications(): Promise<Omit<AppNotification, 'isRead'>[]> {
  const [reminders, documents, maintenance, vehicles] = await Promise.all([
    listReminders(),
    listDocuments(),
    listMaintenance(),
    listVehicles(),
  ]);

  const fromReminders = reminders
    .filter((reminder) => reminder.status === 'overdue' || reminder.status === 'dueSoon')
    .filter((reminder) => reminder.dueDate)
    .map((reminder) => {
      const dueDate = reminder.dueDate as string;
      const due = describeDueDate(dueDate);

      return {
        id: `reminder:${reminder.id}:${dueDate.slice(0, 10)}`,
        kind: 'reminder' as const,
        title: reminder.title,
        body: '',
        bodyTx: due.key,
        bodyValues: due.values,
        createdAt: raisedAt(dueDate, DUE_SOON_DAYS, reminder.status === 'overdue'),
        href: '/(main)/services/service-reminders',
      };
    });

  const fromDocuments = documents
    .filter((document) => document.status === 'expired' || document.status === 'expiringSoon')
    .filter((document) => document.expiryDate)
    .map((document) => {
      const expiryDate = document.expiryDate as string;
      const due = describeDueDate(expiryDate);

      return {
        id: `document:${document.id}:${expiryDate.slice(0, 10)}`,
        kind: 'documentExpiry' as const,
        title: document.title,
        body: '',
        bodyTx: due.key,
        bodyValues: due.values,
        createdAt: raisedAt(
          expiryDate,
          DOCUMENT_EXPIRY_WARNING_DAYS,
          document.status === 'expired'
        ),
        href: '/(main)/services/vehicle-documents',
      };
    });

  // Services whose interval is nearly up, per vehicle, because each one counts
  // against its own odometer. The status is part of the id so that going from
  // "due soon" to "overdue" is a new notification rather than a read one.
  const fromMaintenance = vehicles.flatMap((vehicle) =>
    projectServiceDues(
      maintenance.filter((record) => record.vehicleId === vehicle.id),
      vehicle.odometer
    )
      .filter((due) => due.status !== 'upcoming')
      .map((due) => {
        const detail = describeServiceDue(due);
        const { record } = due;
        const isNamedByUser = record.serviceType === 'other' && Boolean(record.customTitle);

        return {
          id: `maintenance:${record.id}:${due.status}`,
          kind: 'maintenanceDue' as const,
          title: record.customTitle ?? '',
          titleTx: isNamedByUser ? undefined : `serviceTypes.${record.serviceType}`,
          body: '',
          bodyTx: detail.key,
          bodyValues: detail.values,
          // A distance trigger has no moment it was crossed that the app can
          // know, so it is dated today; a date trigger uses its due date.
          createdAt:
            due.basis === 'date' && due.dueDate
              ? raisedAt(due.dueDate, DUE_SOON_DAYS, due.status === 'overdue')
              : dayjs().startOf('day').toISOString(),
          href: '/(main)/(tabs)/Maintenance',
        };
      })
  );

  return [...fromReminders, ...fromDocuments, ...fromMaintenance];
}

function newestFirst(notifications: AppNotification[]): AppNotification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/* ── Queries ──────────────────────────────────────────────────────────────── */

export async function listNotifications(): Promise<AppNotification[]> {
  if (!isLive('notifications')) {
    return delay(newestFirst(db.notifications));
  }

  const [derived, readIds] = await Promise.all([deriveNotifications(), getReadIds()]);

  return newestFirst(
    derived.map((notification) => ({
      ...notification,
      isRead: readIds.includes(notification.id),
    }))
  );
}

export async function markNotificationRead(id: string): Promise<string> {
  if (!isLive('notifications')) {
    const found = db.notifications.find((notification) => notification.id === id);
    if (!found) throw new RepositoryError('Notification not found', 404);

    found.isRead = true;
    return delay(id, 120);
  }

  await addReadIds([id]);

  return id;
}

export async function markAllNotificationsRead(): Promise<void> {
  if (!isLive('notifications')) {
    db.notifications.forEach((notification) => {
      notification.isRead = true;
    });

    await delay(null, 200);
    return;
  }

  const derived = await deriveNotifications();
  await addReadIds(derived.map((notification) => notification.id));
}

/** Creates a local notification record in the mock store. */
export async function pushNotification(
  notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>
): Promise<AppNotification> {
  const record: AppNotification = {
    ...notification,
    id: mockId('ntf'),
    isRead: false,
    createdAt: dayjs().toISOString(),
  };

  db.notifications.unshift(record);
  return delay(record, 100);
}
