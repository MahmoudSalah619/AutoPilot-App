/**
 * Data-layer configuration.
 *
 * ── How the app picks a backend ────────────────────────────────────────────
 * `EXPO_PUBLIC_USE_MOCK_DATA=false` plus Supabase credentials in `.env` puts
 * the app on the live project. It does *not* put every screen on it: the
 * live schema only backs some of the app's domains today, so `BACKENDS`
 * below records which ones are real and which still serve mock data.
 *
 * Domains marked `mock` have no table in the project yet. `apis/migrations/
 * 001_app_gap.sql` is the SQL that would create them; once it is applied,
 * flip the domain here and delete its mock branch.
 */

/** Every slice of the data layer that can be backed independently. */
export type DataDomain =
  | 'auth'
  | 'profile'
  | 'vehicles'
  | 'reference'
  | 'maintenance'
  | 'reminders'
  | 'fuel'
  | 'documents'
  | 'climate'
  | 'trips'
  | 'notifications'
  | 'diagnostics';

/**
 * When true, every domain serves from the in-memory mock store. Defaults to
 * true so the app stays fully explorable without credentials.
 */
export const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA !== 'false';
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

/**
 * Which domains the live Supabase project can actually serve.
 *
 * `partial` means the table exists but is narrower than the app's model, so
 * some fields round-trip as `undefined` — see `UNBACKED_FIELDS`.
 */
export const BACKENDS: Record<DataDomain, 'supabase' | 'partial' | 'mock'> = {
  auth: 'supabase',
  // No `profiles` table — name, phone, address and preferences round-trip
  // through `auth.users.user_metadata` instead. Real and per-user, but not
  // queryable, so a `profiles` table is still the right end state.
  profile: 'partial',
  vehicles: 'partial',
  reference: 'supabase', // car_makes, car_models, services_types, tips
  maintenance: 'partial',
  reminders: 'partial',
  // `gas_consumption`. Note this table is missing its SELECT/INSERT/UPDATE/
  // DELETE grants for `anon` and `authenticated`, so every request fails with
  // "permission denied" (42501) regardless of RLS. Section 0 of the migration
  // fixes it; until then fuel is live in code but dead in practice.
  fuel: 'partial',
  documents: 'partial',
  climate: 'mock', // no `climate_records` table
  trips: 'mock', // no `trips` table
  notifications: 'mock', // no `notifications` table
  diagnostics: 'mock', // no `diagnostic_codes` table
};

/**
 * Model fields the live schema has nowhere to put. Kept here rather than
 * scattered through the repositories so the cost of the current schema is
 * visible in one place, and so the migration has a checklist.
 */
export const UNBACKED_FIELDS: Partial<Record<DataDomain, readonly string[]>> = {
  vehicles: [
    'nickname',
    'plateNumber',
    'vin',
    'color',
    'fuelType',
    'transmission',
    'odometerUpdatedAt',
    'tankCapacity',
    'photoUrl',
  ],
  maintenance: ['customTitle', 'currency', 'intervalMonths', 'workshop'],
  reminders: [
    'title',
    'serviceType',
    'trigger',
    'dueOdometer',
    'repeatEveryMonths',
    'repeatEveryKm',
  ],
  fuel: ['odometer', 'pricePerLiter', 'totalCost', 'currency', 'stationName', 'isFullTank'],
  documents: ['type', 'issueDate', 'expiryDate', 'fileName', 'fileSize', 'mimeType', 'notes'],
} as const;

/**
 * True when `domain` should talk to Supabase on this run.
 *
 * A `partial` domain still counts as live — it reads and writes the real
 * table, just with fewer columns than the model carries.
 */
export function isLive(domain: DataDomain): boolean {
  if (USE_MOCK_DATA) return false;
  return BACKENDS[domain] !== 'mock';
}

/**
 * True when the active backend can actually store `field`.
 *
 * The difference between "we know this is empty" and "we cannot know" is not
 * cosmetic. `odometerUpdatedAt` has no column in the live schema, so it comes
 * back undefined for every vehicle — and code that reads undefined as "never
 * updated" will tell every user their odometer is stale, forever, and act on
 * it. Ask this before drawing a conclusion from a missing value.
 */
export function isFieldBacked(domain: DataDomain, field: string): boolean {
  if (!isLive(domain)) return true; // The mock store carries the full model.
  return !UNBACKED_FIELDS[domain]?.includes(field);
}

/** Artificial delay on mock calls, so loading states are exercised in dev. */
export const MOCK_LATENCY_MS = 280;

/** Table names as they exist in the live project. */
export const TABLES = {
  vehicles: 'vehicles',
  maintenance: 'maintenance',
  serviceReminders: 'service_reminders',
  gasConsumption: 'gas_consumption',
  vehicleDocuments: 'vehicle_documents',
  carMakes: 'car_makes',
  carModels: 'car_models',
  servicesTypes: 'services_types',
  tips: 'tips',
} as const;

/**
 * Tables the app needs but the project does not have yet.
 *
 * The repositories for these domains keep their Supabase branch written
 * against these names — unreachable while `BACKENDS` marks them `mock`, and
 * ready the moment the migration creates them.
 */
export const PLANNED_TABLES = {
  profiles: 'profiles',
  climateRecords: 'climate_records',
  trips: 'trips',
  notifications: 'notifications',
  diagnosticCodes: 'diagnostic_codes',
} as const;

/**
 * Storage buckets. The project has a single private bucket; uploads are
 * namespaced by user id so one owner's files never collide with another's.
 */
export const BUCKETS = {
  documents: 'storage',
} as const;

/**
 * Deep links Supabase sends the user back to from an email.
 *
 * Two distinct paths rather than one: under PKCE both the confirmation and
 * the recovery link arrive as a bare `?code=…`, so the path is the only thing
 * that says whether the app should sign the user in or take them to a
 * set-a-new-password screen.
 *
 * Both must be listed under Authentication > URL Configuration > Redirect
 * URLs in the Supabase dashboard, or the link comes back rejected.
 */
export const AUTH_REDIRECTS = {
  /** Email confirmation after sign-up. */
  confirm: 'autopilot://auth/callback',
  /** Password recovery. */
  recovery: 'autopilot://auth/reset-password',
} as const;
