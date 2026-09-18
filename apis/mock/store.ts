/**
 * In-memory mock backend.
 *
 * Holds mutable copies of the seed data so create/update/delete behave like a
 * real database for the lifetime of the app session. Swapped out wholesale by
 * flipping `USE_MOCK_DATA`; no screen imports this file directly.
 */

import { MOCK_LATENCY_MS } from '@/apis/config';
import type {
  AppNotification,
  ClimateRecord,
  FuelEntry,
  MaintenanceRecord,
  ServiceReminder,
  Trip,
  UserPreferences,
  UserProfile,
  Vehicle,
  VehicleDocument,
} from '@/@types/models';
import {
  seedClimateRecords,
  seedDocuments,
  seedFuelEntries,
  seedMaintenance,
  seedNotifications,
  seedPreferences,
  seedProfile,
  seedReminders,
  seedTrips,
  seedVehicles,
} from './seed';

interface MockDatabase {
  profile: UserProfile;
  preferences: UserPreferences;
  vehicles: Vehicle[];
  maintenance: MaintenanceRecord[];
  reminders: ServiceReminder[];
  fuelEntries: FuelEntry[];
  documents: VehicleDocument[];
  climateRecords: ClimateRecord[];
  trips: Trip[];
  notifications: AppNotification[];
}

/** Deep clone so mutations never leak back into the seed module. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export const db: MockDatabase = {
  profile: clone(seedProfile),
  preferences: clone(seedPreferences),
  vehicles: clone(seedVehicles),
  maintenance: clone(seedMaintenance),
  reminders: clone(seedReminders),
  fuelEntries: clone(seedFuelEntries),
  documents: clone(seedDocuments),
  climateRecords: clone(seedClimateRecords),
  trips: clone(seedTrips),
  notifications: clone(seedNotifications),
};

/** Restores every table to its seeded state. Used by the dev reset action. */
export function resetMockDatabase() {
  db.profile = clone(seedProfile);
  db.preferences = clone(seedPreferences);
  db.vehicles = clone(seedVehicles);
  db.maintenance = clone(seedMaintenance);
  db.reminders = clone(seedReminders);
  db.fuelEntries = clone(seedFuelEntries);
  db.documents = clone(seedDocuments);
  db.climateRecords = clone(seedClimateRecords);
  db.trips = clone(seedTrips);
  db.notifications = clone(seedNotifications);
}

/** Simulates network latency so loading and skeleton states get exercised. */
export function delay<T>(value: T, ms: number = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(clone(value)), ms));
}

/** Collision-resistant enough for a mock; the real backend issues UUIDs. */
export function mockId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
