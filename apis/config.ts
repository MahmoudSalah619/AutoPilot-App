/**
 * Data-layer configuration.
 *
 * This is the design branch: every screen runs on the in-memory mock store
 * (`apis/mock`), so the UI can be built and reviewed without an account, a
 * network or a Supabase project. The live backend lives on the `integration`
 * branch.
 *
 * The flag is hard-wired rather than read from `.env` on purpose. Metro
 * inlines `EXPO_PUBLIC_*` values into its transform cache, so after switching
 * here from `integration` (which sets `EXPO_PUBLIC_USE_MOCK_DATA=false`) a
 * stale bundle could keep talking to Supabase and fail with "Not
 * authenticated". A literal cannot go stale.
 */
export const USE_MOCK_DATA: boolean = true;

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
