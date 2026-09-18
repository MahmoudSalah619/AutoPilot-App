/**
 * Domain rules shared by the UI and the repository layer.
 *
 * Status is *derived*, never stored: a reminder becomes overdue simply because
 * time passed, so computing it on read keeps the UI honest without a cron job.
 */

import dayjs from 'dayjs';
import type {
  DocumentStatus,
  FuelEntry,
  FuelStatistics,
  MaintenanceRecord,
  MaintenanceStatus,
  ReminderStatus,
  ServiceReminder,
  ServiceTypeKey,
  Trip,
  TripEstimate,
  Vehicle,
  VehicleDocument,
} from '@/@types/models';
import { daysSince, daysUntil } from './date';

/** A service falling due within this many days is flagged "due soon". */
export const DUE_SOON_DAYS = 14;

/** A document expiring within this many days is flagged "expiring soon". */
export const DOCUMENT_EXPIRY_WARNING_DAYS = 30;

/** Remaining kilometers below this fraction of the interval counts as due soon. */
export const DUE_SOON_KM = 500;

/* ── Odometer freshness ───────────────────────────────────────────────────── */

/** A reading younger than this is current, and the UI stays calm. */
export const ODOMETER_FRESH_DAYS = 7;

/** At this age the reading is stale enough to actively ask for an update. */
export const ODOMETER_STALE_DAYS = 21;

/**
 * How trustworthy the stored odometer reading is.
 *
 * This is the app's load-bearing number: distance-triggered reminders, service
 * intervals and fuel economy are all measured against it, so a stale reading
 * quietly degrades everything else. Surfacing its age is what lets the UI ask
 * for an update only when asking is actually warranted.
 */
export type OdometerFreshness = 'never' | 'fresh' | 'aging' | 'stale';

export function resolveOdometerFreshness(updatedAt?: string): OdometerFreshness {
  if (!updatedAt) return 'never';

  const age = daysSince(updatedAt);
  if (!Number.isFinite(age)) return 'never';

  if (age <= ODOMETER_FRESH_DAYS) return 'fresh';
  if (age < ODOMETER_STALE_DAYS) return 'aging';

  return 'stale';
}

/** True when the reading is old enough to justify interrupting the user. */
export function isOdometerStale(updatedAt?: string): boolean {
  const freshness = resolveOdometerFreshness(updatedAt);
  return freshness === 'stale' || freshness === 'never';
}

/**
 * The nearest distance-triggered reminder, as progress toward its due point.
 *
 * Powers the "next service in N km" line on the home card, which is what makes
 * updating the odometer feel purposeful rather than like data entry.
 */
export interface DistanceMilestone {
  title: string;
  /** Kilometers left before it is due. Negative once overdue. */
  remainingKm: number;
  /** 0 to 1 through the interval. 1 means due now. */
  progress: number;
  isOverdue: boolean;
}

export function nextDistanceMilestone(
  reminders: ServiceReminder[],
  currentOdometer: number
): DistanceMilestone | undefined {
  const candidates = reminders
    .filter((reminder) => reminder.isActive && reminder.dueOdometer != null)
    .filter((reminder) => reminder.trigger !== 'date')
    .map((reminder) => ({
      reminder,
      remainingKm: (reminder.dueOdometer as number) - currentOdometer,
    }))
    // Closest to due first, with already-overdue items ranking ahead.
    .sort((a, b) => a.remainingKm - b.remainingKm);

  const nearest = candidates[0];
  if (!nearest) return undefined;

  const span = nearest.reminder.repeatEveryKm ?? DUE_SOON_KM * 20;

  return {
    title: nearest.reminder.title,
    remainingKm: nearest.remainingKm,
    progress: Math.max(0, Math.min(1, 1 - nearest.remainingKm / span)),
    isOverdue: nearest.remainingKm <= 0,
  };
}

/* ── Maintenance ──────────────────────────────────────────────────────────── */

/** Manufacturer-typical service intervals, used to pre-fill forms. */
export const DEFAULT_SERVICE_INTERVALS: Record<ServiceTypeKey, { km?: number; months?: number }> = {
  oilChange: { km: 10000, months: 12 },
  tireRotation: { km: 10000, months: 6 },
  brakeService: { km: 40000, months: 24 },
  airFilter: { km: 20000, months: 12 },
  cabinFilter: { km: 15000, months: 12 },
  sparkPlugs: { km: 60000, months: 48 },
  batteryService: { months: 36 },
  coolantFlush: { km: 60000, months: 36 },
  transmissionService: { km: 60000, months: 48 },
  wheelAlignment: { km: 20000, months: 12 },
  acService: { months: 24 },
  generalInspection: { km: 20000, months: 12 },
  other: {},
};

export function resolveMaintenanceStatus(date: string, isCompleted = false): MaintenanceStatus {
  if (isCompleted) return 'completed';

  const days = daysUntil(date);
  if (days < 0) return 'overdue';
  if (days <= DUE_SOON_DAYS) return 'dueSoon';

  return 'upcoming';
}

/** Projects the next due date from the last service date and its interval. */
export function projectNextService(record: MaintenanceRecord): string | undefined {
  if (!record.intervalMonths) return undefined;
  return dayjs(record.date).add(record.intervalMonths, 'month').toISOString();
}

/* ── Reminders ────────────────────────────────────────────────────────────── */

/**
 * Resolves a reminder's status from whichever of its triggers is closest.
 *
 * A `both` reminder fires on whichever comes first — date or distance — which
 * is how real service schedules are written ("10,000 km or 12 months").
 */
export function resolveReminderStatus(
  reminder: Pick<ServiceReminder, 'trigger' | 'dueDate' | 'dueOdometer' | 'isActive'>,
  currentOdometer: number
): ReminderStatus {
  if (!reminder.isActive) return 'completed';

  const statuses: ReminderStatus[] = [];

  if (reminder.dueDate && reminder.trigger !== 'distance') {
    const days = daysUntil(reminder.dueDate);
    if (days < 0) statuses.push('overdue');
    else if (days <= DUE_SOON_DAYS) statuses.push('dueSoon');
    else statuses.push('active');
  }

  if (reminder.dueOdometer != null && reminder.trigger !== 'date') {
    const remaining = reminder.dueOdometer - currentOdometer;
    if (remaining <= 0) statuses.push('overdue');
    else if (remaining <= DUE_SOON_KM) statuses.push('dueSoon');
    else statuses.push('active');
  }

  if (statuses.includes('overdue')) return 'overdue';
  if (statuses.includes('dueSoon')) return 'dueSoon';

  return 'active';
}

/**
 * Progress toward a reminder's due point, 0 to 1.
 * Distance-based reminders report distance progress; otherwise time is used.
 */
export function reminderProgress(reminder: ServiceReminder, currentOdometer: number): number {
  if (reminder.dueOdometer != null && reminder.trigger !== 'date') {
    const span = reminder.repeatEveryKm ?? DUE_SOON_KM * 20;
    const remaining = reminder.dueOdometer - currentOdometer;
    return Math.max(0, Math.min(1, 1 - remaining / span));
  }

  if (reminder.dueDate) {
    const span = (reminder.repeatEveryMonths ?? 12) * 30;
    const remaining = daysUntil(reminder.dueDate);
    return Math.max(0, Math.min(1, 1 - remaining / span));
  }

  return 0;
}

/* ── Documents ────────────────────────────────────────────────────────────── */

export function resolveDocumentStatus(expiryDate?: string): DocumentStatus {
  if (!expiryDate) return 'noExpiry';

  const days = daysUntil(expiryDate);
  if (days < 0) return 'expired';
  if (days <= DOCUMENT_EXPIRY_WARNING_DAYS) return 'expiringSoon';

  return 'valid';
}

/* ── Fuel ─────────────────────────────────────────────────────────────────── */

/** Kilometers per liter for a single fill-up. */
export function entryEfficiency(entry: FuelEntry): number {
  if (!entry.liters || entry.liters <= 0) return 0;
  return entry.distanceKm / entry.liters;
}

/**
 * Aggregate fuel statistics.
 *
 * Only full-tank entries contribute to efficiency figures — a partial fill
 * does not tell you how much fuel the preceding distance actually consumed.
 * Cost and volume totals still include every entry.
 */
export function calculateFuelStatistics(entries: FuelEntry[]): FuelStatistics {
  const empty: FuelStatistics = {
    averageKmPerLiter: 0,
    bestKmPerLiter: 0,
    worstKmPerLiter: 0,
    totalDistanceKm: 0,
    totalLiters: 0,
    totalCost: 0,
    entryCount: 0,
    trendPercent: 0,
  };

  if (entries.length === 0) return empty;

  const totalLiters = entries.reduce((sum, entry) => sum + entry.liters, 0);
  const totalDistanceKm = entries.reduce((sum, entry) => sum + entry.distanceKm, 0);
  // Older rows may carry only a unit price, so spend is reconstructed rather
  // than silently counted as zero.
  const totalCost = entries.reduce(
    (sum, entry) =>
      sum + (entry.totalCost ?? (entry.pricePerLiter ? entry.pricePerLiter * entry.liters : 0)),
    0
  );

  const measurable = entries
    .filter((entry) => entry.isFullTank && entry.liters > 0 && entry.distanceKm > 0)
    .map(entryEfficiency);

  if (measurable.length === 0) {
    return { ...empty, totalLiters, totalDistanceKm, totalCost, entryCount: entries.length };
  }

  const average = measurable.reduce((sum, value) => sum + value, 0) / measurable.length;

  // Compare the most recent third against the rest to surface a direction of travel.
  const recentCount = Math.max(1, Math.floor(measurable.length / 3));
  const recent = measurable.slice(0, recentCount);
  const earlier = measurable.slice(recentCount);

  const recentAverage = recent.reduce((sum, value) => sum + value, 0) / recent.length;
  const earlierAverage = earlier.length
    ? earlier.reduce((sum, value) => sum + value, 0) / earlier.length
    : recentAverage;

  const trendPercent =
    earlierAverage > 0 ? ((recentAverage - earlierAverage) / earlierAverage) * 100 : 0;

  return {
    averageKmPerLiter: average,
    bestKmPerLiter: Math.max(...measurable),
    worstKmPerLiter: Math.min(...measurable),
    totalDistanceKm,
    totalLiters,
    totalCost,
    entryCount: entries.length,
    trendPercent,
  };
}

/** Buckets efficiency into a tone, for coloring badges and stats consistently. */
export function efficiencyTone(
  kmPerLiter: number,
  average: number
): 'success' | 'warning' | 'danger' {
  if (average <= 0) return 'warning';
  if (kmPerLiter >= average * 1.05) return 'success';
  if (kmPerLiter >= average * 0.9) return 'warning';

  return 'danger';
}

/* ── Trips ────────────────────────────────────────────────────────────────── */

/**
 * Estimates fuel and cost for a trip using the vehicle's measured efficiency,
 * and surfaces anything due before departure that the driver should deal with
 * first.
 */
export function estimateTrip(
  trip: Trip,
  averageKmPerLiter: number,
  vehicle?: Vehicle,
  blockingIssues: string[] = []
): TripEstimate {
  const totalDistance = trip.distanceKm * (trip.isRoundTrip ? 2 : 1);
  const efficiency = averageKmPerLiter > 0 ? averageKmPerLiter : 12;

  const estimatedLiters = totalDistance / efficiency;
  const estimatedFuelCost = estimatedLiters * trip.fuelPricePerLiter;
  const travellers = Math.max(1, trip.travellers);

  const tankCapacity = vehicle?.tankCapacity ?? 50;
  const refuelStops = Math.max(0, Math.ceil(estimatedLiters / tankCapacity) - 1);

  return {
    estimatedLiters,
    estimatedFuelCost,
    costPerTraveller: estimatedFuelCost / travellers,
    refuelStops,
    blockingIssues,
  };
}

/** Reminders and documents that come due before the trip returns. */
export function findTripBlockers(
  trip: Trip,
  reminders: ServiceReminder[],
  documents: VehicleDocument[]
): string[] {
  const horizon = dayjs(trip.returnDate ?? trip.departureDate);
  const blockers: string[] = [];

  reminders
    .filter((reminder) => reminder.isActive && reminder.dueDate)
    .filter((reminder) => dayjs(reminder.dueDate).isBefore(horizon))
    .forEach((reminder) => blockers.push(reminder.title));

  documents
    .filter((document) => document.expiryDate)
    .filter((document) => dayjs(document.expiryDate).isBefore(horizon))
    .forEach((document) => blockers.push(document.title));

  return blockers;
}
