/**
 * Data-layer configuration.
 *
 * ── Switching to a live Supabase backend ───────────────────────────────────
 * 1. Put `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`.
 * 2. Create the tables listed in `TABLES` below (see `apis/schema.sql`).
 * 3. Set `EXPO_PUBLIC_USE_MOCK_DATA=false` in `.env`.
 *
 * Nothing else changes: every repository already has its Supabase branch
 * written, and the mock branch is only consulted while the flag is on.
 */

/**
 * When true, repositories serve from the in-memory mock store instead of
 * Supabase. Defaults to true so the app is fully explorable before the
 * backend exists.
 */
export const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA !== 'false';

/** Artificial delay on mock calls, so loading states are exercised in dev. */
export const MOCK_LATENCY_MS = 280;

/** Supabase table names. Keep in sync with `apis/schema.sql`. */
export const TABLES = {
  profiles: 'profiles',
  vehicles: 'vehicles',
  maintenanceRecords: 'maintenance_records',
  serviceReminders: 'service_reminders',
  fuelEntries: 'fuel_entries',
  vehicleDocuments: 'vehicle_documents',
  climateRecords: 'climate_records',
  trips: 'trips',
  notifications: 'notifications',
  diagnosticCodes: 'diagnostic_codes',
} as const;

/** Supabase Storage buckets. */
export const BUCKETS = {
  documents: 'vehicle-documents',
  avatars: 'avatars',
  vehiclePhotos: 'vehicle-photos',
} as const;
