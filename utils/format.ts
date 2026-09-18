import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import i18n from '@/locale';
import type { CurrencyCode, ISODate } from '@/@types/models';

// Re-exported so callers that format a date can keep a single import.
export { daysSince, daysUntil, describeDueDate, isPast } from './date';

dayjs.extend(relativeTime);

/** Locale to hand to `Intl`, derived from the active i18n language. */
function activeLocale(): string {
  return i18n.language === 'ar' ? 'ar-EG' : 'en-US';
}

/** `12,450` — thousands-separated integer. */
export function formatNumber(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return '—';

  return new Intl.NumberFormat(activeLocale(), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** `12,450 km` */
export function formatDistance(km: number): string {
  return `${formatNumber(Math.round(km))} ${i18n.t('units.km')}`;
}

/** `38.5 L` */
export function formatVolume(liters: number): string {
  return `${formatNumber(liters, 1)} ${i18n.t('units.liter')}`;
}

/** `13.8 km/L` */
export function formatEfficiency(kmPerLiter: number): string {
  if (!Number.isFinite(kmPerLiter) || kmPerLiter <= 0) return '—';
  return `${formatNumber(kmPerLiter, 1)} ${i18n.t('units.kmPerLiter')}`;
}

/** `EGP 1,250.00` — falls back to a plain number if the code is unknown. */
export function formatCurrency(value: number, currency: CurrencyCode = 'EGP'): string {
  if (!Number.isFinite(value)) return '—';

  try {
    return new Intl.NumberFormat(activeLocale(), {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${formatNumber(value)} ${currency}`;
  }
}

/** `14 Mar 2026` */
export function formatDate(date?: ISODate): string {
  if (!date) return '—';
  return dayjs(date).locale(i18n.language).format('D MMM YYYY');
}

/** `14 Mar 2026, 09:30` */
export function formatDateTime(date?: ISODate): string {
  if (!date) return '—';
  return dayjs(date).locale(i18n.language).format('D MMM YYYY, HH:mm');
}

/** `in 3 days` / `2 months ago` */
export function formatRelative(date?: ISODate): string {
  if (!date) return '—';
  return dayjs(date).locale(i18n.language).fromNow();
}

/** `2.4 MB` */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '—';

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
