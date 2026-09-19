/**
 * End-to-end check of the live Supabase integration.
 *
 * Signs up a throwaway account, exercises every write the repository layer
 * performs — with the same column shapes `apis/repositories/*` produce — then
 * reads the rows back and deletes them. It is a check of the *schema
 * assumptions*, not of the React layer: not-null columns, foreign keys, enum
 * values, RLS and grants are what break silently, and those are what this
 * catches.
 *
 * Run with:  node scripts/verifySupabase.mjs
 * It leaves the auth user behind; delete it from the dashboard afterwards.
 */

import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  fs
    .readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.startsWith('#'))
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    })
);

const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const results = [];
const record = (step, ok, detail = '') => {
  results.push({ step, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${step.padEnd(34)} ${detail}`);
};

const stamp = Date.now();
// Supabase rejects domains with no MX record, so `example.com` and friends
// are out. `mail.com` resolves, and with email confirmation off nothing is
// ever delivered — the address is only a unique string on the row. It
// matches the `test@mail.com` convention already in this project.
const email = `autopilot-int-test-${stamp}@mail.com`;
const password = `Test-${stamp}-Aa1`;

/* ── Auth ─────────────────────────────────────────────────────────────────── */

const { data: signUp, error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { first_name: 'Integration', last_name: 'Test' } },
});

if (signUpError) {
  record('auth.signUp', false, signUpError.message);
  console.log('\nCannot continue without an account.');
  process.exit(1);
}

record('auth.signUp', true, signUp.session ? 'session issued' : 'awaiting email confirmation');

if (!signUp.session) {
  console.log(
    '\nEmail confirmation is ON for this project, so there is no session to write with.\n' +
      'Confirm the address or switch confirmation off to run the data checks.'
  );
  process.exit(0);
}

const userId = signUp.user.id;

const { data: userAfter } = await supabase.auth.getUser();
record(
  'auth metadata carries name',
  userAfter?.user?.user_metadata?.first_name === 'Integration',
  JSON.stringify(userAfter?.user?.user_metadata ?? {})
);

/* ── Reference data ───────────────────────────────────────────────────────── */

const { data: makes, error: makesError } = await supabase
  .from('car_makes')
  .select('id, name')
  .eq('is_active', true)
  .order('name');

record('car_makes readable', !makesError, makesError?.message ?? `${makes?.length ?? 0} rows`);

const { data: serviceTypes, error: serviceTypesError } = await supabase
  .from('services_types')
  .select('id, name');

record(
  'services_types readable',
  !serviceTypesError,
  serviceTypesError?.message ?? `${serviceTypes?.length ?? 0} rows`
);

const makeId = makes?.find((m) => m.name?.toLowerCase() === 'toyota')?.id ?? makes?.[0]?.id ?? null;
const serviceTypeId = serviceTypes?.[0]?.id ?? null;

/* ── Vehicles ─────────────────────────────────────────────────────────────── */

const { data: vehicle, error: vehicleError } = await supabase
  .from('vehicles')
  // Exactly what `toVehicleRow` builds: make as an FK, year as a date.
  .insert({
    user_id: userId,
    make: makeId,
    model: 'Corolla',
    year: '2019-01-01',
    odometer: 84000,
    is_primary: true,
  })
  .select('id, user_id, make, model, year, odometer, is_primary, created_at')
  .single();

record('vehicles insert', !vehicleError, vehicleError?.message ?? `id ${vehicle?.id}`);

if (!vehicle) {
  console.log('\nNo vehicle, so the child tables cannot be exercised.');
  process.exit(1);
}

record(
  'vehicles year round-trips',
  String(vehicle.year).slice(0, 4) === '2019',
  `stored ${vehicle.year}`
);

/* ── Children ─────────────────────────────────────────────────────────────── */

const { error: maintenanceError } = await supabase.from('maintenance').insert({
  vehicle_id: vehicle.id,
  service_type: serviceTypeId,
  date: '2026-09-01',
  odometer: 83000,
  cost: 1200,
  interval: 10000,
  notes: 'integration test',
  status: 'completed',
});

record('maintenance insert', !maintenanceError, maintenanceError?.message ?? '');

const { error: reminderError } = await supabase.from('service_reminders').insert({
  vehicle_id: vehicle.id,
  date: '2026-12-01',
  notes: 'Renew insurance',
  is_completed: false,
});

record('service_reminders insert', !reminderError, reminderError?.message ?? '');

const { error: fuelError } = await supabase.from('gas_consumption').insert({
  vehicle_id: vehicle.id,
  date: '2026-09-10',
  kilometers_driven: 420,
  liters_consumed: 35,
});

record('gas_consumption insert', !fuelError, fuelError?.message ?? '');

const { error: documentError } = await supabase.from('vehicle_documents').insert({
  vehicle_id: vehicle.id,
  name: 'Insurance',
  image: '',
});

record('vehicle_documents insert', !documentError, documentError?.message ?? '');

/* ── Storage ──────────────────────────────────────────────────────────────── */

// The bucket restricts mime types to jpeg/png/webp/pdf, so the probe has to
// be one of those — a text file is rejected before any policy is consulted.
const PNG_1PX = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  ),
  (c) => c.charCodeAt(0)
);

const uploadPath = `${userId}/${stamp}-test.png`;

const { error: uploadError } = await supabase.storage
  .from('storage')
  .upload(uploadPath, PNG_1PX, { contentType: 'image/png' });

record('storage upload', !uploadError, uploadError?.message ?? 'uploaded');

/* ── Read back ────────────────────────────────────────────────────────────── */

const { data: readBack, error: readError } = await supabase
  .from('vehicles')
  .select('id, model, odometer, maintenance(id), service_reminders(id), vehicle_documents(id)')
  .eq('id', vehicle.id)
  .single();

record(
  'read back with children',
  !readError,
  readError?.message ??
    `maintenance ${readBack?.maintenance?.length ?? 0}, reminders ${readBack?.service_reminders?.length ?? 0}, docs ${readBack?.vehicle_documents?.length ?? 0}`
);

/* ── RLS ──────────────────────────────────────────────────────────────────── */

const anon = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const { data: leaked } = await anon.from('vehicles').select('id').eq('id', vehicle.id);
record(
  'RLS hides row from anon',
  (leaked?.length ?? 0) === 0,
  `${leaked?.length ?? 0} rows visible`
);

/* ── Cleanup ──────────────────────────────────────────────────────────────── */

for (const table of ['maintenance', 'service_reminders', 'gas_consumption', 'vehicle_documents']) {
  await supabase.from(table).delete().eq('vehicle_id', vehicle.id);
}

const { error: deleteError } = await supabase.from('vehicles').delete().eq('id', vehicle.id);
record('cleanup', !deleteError, deleteError?.message ?? 'rows removed');

await supabase.storage.from('storage').remove([uploadPath]);

/* ── Summary ──────────────────────────────────────────────────────────────── */

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
console.log(`Test auth user left behind: ${email} (${userId})`);

process.exit(failed.length > 0 ? 1 : 0);
