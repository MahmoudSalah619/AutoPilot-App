/**
 * Date arithmetic with no i18n or rendering concerns.
 *
 * Kept separate from `format.ts` so the domain rules that depend on it stay
 * pure and testable — `format.ts` pulls in the i18n instance, which needs a
 * running app.
 */

import dayjs from 'dayjs';
import type { ISODate } from '@/@types/models';

/** Whole days from today until `date`. Negative once the date has passed. */
export function daysUntil(date?: ISODate): number {
  if (!date) return Number.POSITIVE_INFINITY;
  return dayjs(date).startOf('day').diff(dayjs().startOf('day'), 'day');
}

/** Whole days since `date`. Negative while it is still in the future. */
export function daysSince(date?: ISODate): number {
  if (!date) return Number.POSITIVE_INFINITY;
  return dayjs().startOf('day').diff(dayjs(date).startOf('day'), 'day');
}

export function isPast(date?: ISODate): boolean {
  return Boolean(date) && dayjs(date).isBefore(dayjs(), 'day');
}

/**
 * Translation key (plus interpolation values) describing a due date, e.g.
 * "Due today", "In 12 days", "5 days overdue".
 *
 * Returns a key rather than a string so the caller renders it in the active
 * language.
 */
export function describeDueDate(date?: ISODate): {
  key: string;
  values?: Record<string, number>;
} {
  const days = daysUntil(date);

  if (!Number.isFinite(days)) return { key: 'common.noDate' };
  if (days === 0) return { key: 'due.today' };
  if (days === 1) return { key: 'due.tomorrow' };
  if (days === -1) return { key: 'due.yesterday' };
  if (days > 0) return { key: 'due.inDays', values: { count: days } };

  return { key: 'due.overdueByDays', values: { count: Math.abs(days) } };
}
