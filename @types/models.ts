/**
 * AutoPilot domain models.
 *
 * These are the shapes the UI consumes. They intentionally use camelCase and
 * ISO date strings; the repository layer is responsible for mapping to and
 * from whatever the backend stores (Supabase uses snake_case columns).
 */

/** ISO-8601 date string, e.g. `2026-03-14` or a full timestamp. */
export type ISODate = string;

/* ── User ─────────────────────────────────────────────────────────────────── */

export type DistanceUnit = 'km' | 'mi';
export type VolumeUnit = 'liter' | 'gallon';
export type CurrencyCode = 'EGP' | 'USD' | 'EUR' | 'SAR' | 'AED' | 'GBP';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: ISODate;
  address?: string;
  createdAt: ISODate;
}

export interface UserPreferences {
  distanceUnit: DistanceUnit;
  volumeUnit: VolumeUnit;
  currency: CurrencyCode;
  /** Days before a due date that a reminder should fire. */
  reminderLeadDays: number;
}

/* ── Vehicle ──────────────────────────────────────────────────────────────── */

export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'lpg';
export type TransmissionType = 'manual' | 'automatic' | 'cvt' | 'dct';

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  /** Friendly name shown in the UI, e.g. "Daily driver". */
  nickname?: string;
  plateNumber?: string;
  vin?: string;
  color?: string;
  fuelType: FuelType;
  transmission?: TransmissionType;
  /** Current odometer reading, always stored in kilometers. */
  odometer: number;
  odometerUpdatedAt?: ISODate;
  /** Tank capacity in liters, used for range estimates. */
  tankCapacity?: number;
  photoUrl?: string;
  isPrimary: boolean;
  createdAt: ISODate;
}

/* ── Maintenance ──────────────────────────────────────────────────────────── */

export type MaintenanceStatus = 'completed' | 'upcoming' | 'overdue' | 'dueSoon';

/** Canonical service catalogue. Keys double as translation keys. */
export type ServiceTypeKey =
  | 'oilChange'
  | 'tireRotation'
  | 'brakeService'
  | 'airFilter'
  | 'cabinFilter'
  | 'sparkPlugs'
  | 'batteryService'
  | 'coolantFlush'
  | 'transmissionService'
  | 'wheelAlignment'
  | 'acService'
  | 'generalInspection'
  | 'other';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  serviceType: ServiceTypeKey;
  /** Free-text override when `serviceType` is `other`. */
  customTitle?: string;
  date: ISODate;
  /** Odometer reading when the work was done, or is due. */
  odometer?: number;
  cost?: number;
  currency?: CurrencyCode;
  /** Service interval in kilometers, used to project the next due date. */
  intervalKm?: number;
  /** Service interval in months. */
  intervalMonths?: number;
  workshop?: string;
  notes?: string;
  status: MaintenanceStatus;
  createdAt: ISODate;
}

/* ── Reminders ────────────────────────────────────────────────────────────── */

export type ReminderTrigger = 'date' | 'distance' | 'both';
export type ReminderStatus = 'active' | 'dueSoon' | 'overdue' | 'completed';

export interface ServiceReminder {
  id: string;
  vehicleId: string;
  title: string;
  serviceType: ServiceTypeKey;
  trigger: ReminderTrigger;
  dueDate?: ISODate;
  /** Odometer reading at which this becomes due. */
  dueOdometer?: number;
  /** Recurrence, if the reminder should regenerate after completion. */
  repeatEveryMonths?: number;
  repeatEveryKm?: number;
  notes?: string;
  isActive: boolean;
  status: ReminderStatus;
  createdAt: ISODate;
}

/* ── Fuel ─────────────────────────────────────────────────────────────────── */

export interface FuelEntry {
  id: string;
  vehicleId: string;
  date: ISODate;
  /** Odometer at fill-up. */
  odometer: number;
  /** Distance covered since the previous entry, in kilometers. */
  distanceKm: number;
  liters: number;
  pricePerLiter?: number;
  totalCost?: number;
  currency?: CurrencyCode;
  stationName?: string;
  /** Partial fills make the efficiency figure unreliable, so we flag them. */
  isFullTank: boolean;
  notes?: string;
  createdAt: ISODate;
}

export interface FuelStatistics {
  averageKmPerLiter: number;
  bestKmPerLiter: number;
  worstKmPerLiter: number;
  totalDistanceKm: number;
  totalLiters: number;
  totalCost: number;
  entryCount: number;
  /** Percentage change in efficiency versus the preceding period. */
  trendPercent: number;
}

/* ── Documents ────────────────────────────────────────────────────────────── */

export type DocumentType =
  | 'insurance'
  | 'registration'
  | 'driverLicense'
  | 'inspection'
  | 'warranty'
  | 'receipt'
  | 'other';

export type DocumentStatus = 'valid' | 'expiringSoon' | 'expired' | 'noExpiry';

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  title: string;
  type: DocumentType;
  issueDate?: ISODate;
  expiryDate?: ISODate;
  /** Storage path or local URI of the attached file. */
  fileUri?: string;
  fileName?: string;
  /** File size in bytes. */
  fileSize?: number;
  mimeType?: string;
  notes?: string;
  status: DocumentStatus;
  createdAt: ISODate;
}

/* ── Diagnostics (Errors Guide) ───────────────────────────────────────────── */

export type DiagnosticSeverity = 'low' | 'medium' | 'high' | 'critical';

export type DiagnosticSystem =
  | 'engine'
  | 'transmission'
  | 'emissions'
  | 'brakes'
  | 'electrical'
  | 'fuel'
  | 'cooling'
  | 'body';

export interface DiagnosticCode {
  /** OBD-II code, e.g. `P0300`. */
  code: string;
  system: DiagnosticSystem;
  title: string;
  description: string;
  severity: DiagnosticSeverity;
  commonCauses: string[];
  suggestedActions: string[];
  /** Whether the vehicle is safe to keep driving with this fault present. */
  safeToDrive: boolean;
  /** Rough repair cost band, for expectation-setting. */
  estimatedCostBand: 'low' | 'medium' | 'high';
}

/* ── Climate & Comfort ────────────────────────────────────────────────────── */

export type ClimateServiceType =
  | 'cabinFilter'
  | 'acRegas'
  | 'acInspection'
  | 'condenserClean'
  | 'ventSanitize'
  | 'heaterService';

export interface ClimateRecord {
  id: string;
  vehicleId: string;
  type: ClimateServiceType;
  date: ISODate;
  odometer?: number;
  cost?: number;
  currency?: CurrencyCode;
  notes?: string;
  /** Recommended interval for this service, in months. */
  intervalMonths: number;
  createdAt: ISODate;
}

/* ── Roadtrip Planner ─────────────────────────────────────────────────────── */

export interface TripChecklistItem {
  id: string;
  labelKey: string;
  isDone: boolean;
}

export interface Trip {
  id: string;
  vehicleId: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  /** Set for return journeys; doubles the fuel estimate. */
  isRoundTrip: boolean;
  departureDate: ISODate;
  returnDate?: ISODate;
  fuelPricePerLiter: number;
  currency: CurrencyCode;
  /** Passenger count, used for the per-person cost split. */
  travellers: number;
  notes?: string;
  checklist: TripChecklistItem[];
  createdAt: ISODate;
}

export interface TripEstimate {
  estimatedLiters: number;
  estimatedFuelCost: number;
  costPerTraveller: number;
  /** Number of refuelling stops implied by the vehicle's tank capacity. */
  refuelStops: number;
  /** Reminders and documents that fall due before or during the trip. */
  blockingIssues: string[];
}

/* ── Notifications ────────────────────────────────────────────────────────── */

export type NotificationKind =
  | 'reminder'
  | 'documentExpiry'
  | 'maintenanceDue'
  | 'fuelInsight'
  | 'system';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: ISODate;
  isRead: boolean;
  /** In-app route to open when tapped. */
  href?: string;
}
