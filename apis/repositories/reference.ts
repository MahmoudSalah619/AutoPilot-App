/**
 * Shared reference data: car makes, models, service types and tips.
 *
 * These four tables are readable by anyone (`select` policies with `using
 * (true)`) and writable by nobody from the client, so they are cached for the
 * lifetime of the process — they change on a release cadence, not a session
 * one.
 */

import { isLive, TABLES } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { delay } from '@/apis/mock/store';
import type { ServiceTypeKey } from '@/@types/models';
import { dateToYear, toDomainId, unwrapRaw } from './helpers';

export type CarBodyType = 'Sedan' | 'Hatchback' | 'SUV' | 'Van' | 'Sport';
export type TipScreen =
  | 'dashboard'
  | 'gas_consumption'
  | 'error_guide'
  | 'vehicle_documents'
  | 'service_reminders';

export interface CarMake {
  id: string;
  name: string;
  logo?: string;
}

export interface CarModel {
  id: string;
  makeId: string;
  name: string;
  year?: number;
  bodyType?: CarBodyType;
}

export interface ServiceTypeOption {
  id: string;
  name: string;
  /** Recommended interval, in kilometers. */
  interval?: number;
}

export interface Tip {
  id: string;
  title: string;
  description?: string;
  screen: TipScreen;
  type: 'tip' | 'alert';
  isSeen: boolean;
}

/* ── Cache ────────────────────────────────────────────────────────────────── */

let makesCache: CarMake[] | null = null;
let serviceTypesCache: ServiceTypeOption[] | null = null;

/** Clears the reference cache. Call on sign-out so a new user starts clean. */
export function resetReferenceCache(): void {
  makesCache = null;
  serviceTypesCache = null;
}

/* ── Makes & models ───────────────────────────────────────────────────────── */

export async function listCarMakes(): Promise<CarMake[]> {
  if (!isLive('reference')) return delay([], 80);
  if (makesCache) return makesCache;

  const rows = unwrapRaw<{ id: number; name: string | null; logo: string | null }[]>(
    await supabase
      .from(TABLES.carMakes)
      .select('id, name, logo')
      .eq('is_active', true)
      .order('name', { ascending: true })
  );

  makesCache = rows.map((row) => ({
    id: toDomainId(row.id),
    name: row.name ?? '',
    logo: row.logo ?? undefined,
  }));

  return makesCache;
}

export async function listCarModels(makeId?: string): Promise<CarModel[]> {
  if (!isLive('reference')) return delay([], 80);

  let query = supabase
    .from(TABLES.carModels)
    .select('id, make, name, year, body_type')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (makeId) query = query.eq('make', makeId);

  const rows = unwrapRaw<
    {
      id: number;
      make: number | null;
      name: string | null;
      year: string | null;
      body_type: CarBodyType | null;
    }[]
  >(await query);

  return rows.map((row) => ({
    id: toDomainId(row.id),
    makeId: toDomainId(row.make),
    name: row.name ?? '',
    year: dateToYear(row.year),
    bodyType: row.body_type ?? undefined,
  }));
}

/**
 * Turns a make name into its `car_makes` id.
 *
 * The live catalogue has 65 makes and `VehicleForm` picks from it, so a miss
 * here means either mock mode (no catalogue at all) or a vehicle saved before
 * the picker existed. Either way the make is dropped rather than the save
 * refused — `vehicles.make` is nullable, and losing one field beats losing
 * the vehicle.
 */
export async function resolveMakeId(name?: string): Promise<number | null> {
  if (!name?.trim()) return null;

  const makes = await listCarMakes();
  if (makes.length === 0) {
    if (__DEV__) {
      console.warn(`[reference] car_makes is unavailable — saving vehicle without make "${name}".`);
    }

    return null;
  }

  const needle = name.trim().toLowerCase();
  const match = makes.find((make) => make.name.toLowerCase() === needle);

  return match ? Number(match.id) : null;
}

/** Make name for an id, for mapping a row back to the domain model. */
export async function resolveMakeName(id?: number | null): Promise<string> {
  if (id == null) return '';

  const makes = await listCarMakes();
  return makes.find((make) => make.id === String(id))?.name ?? '';
}

/* ── Service types ────────────────────────────────────────────────────────── */

export async function listServiceTypes(): Promise<ServiceTypeOption[]> {
  if (!isLive('reference')) return delay([], 80);
  if (serviceTypesCache) return serviceTypesCache;

  const rows = unwrapRaw<{ id: number; name: string | null; interval: number | null }[]>(
    await supabase
      .from(TABLES.servicesTypes)
      .select('id, name, interval')
      .order('name', { ascending: true })
  );

  serviceTypesCache = rows.map((row) => ({
    id: toDomainId(row.id),
    name: row.name ?? '',
    interval: row.interval ?? undefined,
  }));

  return serviceTypesCache;
}

/**
 * Catalogue names accepted for each of the app's service types.
 *
 * `services_types.name` is free text and does not line up with the app's
 * keys: the project calls a brake service "Brake Inspection" and a battery
 * service "Battery Check". Deriving the name from the key by splitting
 * camelCase — the obvious approach — matches only six of the eleven rows and
 * silently files the rest under "Other", so the pairing is spelled out. The
 * first alias is the preferred spelling for a row the catalogue is missing.
 */
const SERVICE_TYPE_ALIASES: Record<ServiceTypeKey, string[]> = {
  oilChange: ['oil change'],
  tireRotation: ['tire rotation', 'tyre rotation'],
  brakeService: ['brake service', 'brake inspection'],
  airFilter: ['air filter replacement', 'air filter'],
  cabinFilter: ['cabin filter replacement', 'cabin filter'],
  sparkPlugs: ['spark plugs', 'spark plug replacement'],
  batteryService: ['battery service', 'battery check'],
  coolantFlush: ['coolant flush'],
  transmissionService: ['transmission service'],
  wheelAlignment: ['wheel alignment'],
  acService: ['ac service', 'a/c service', 'air conditioning service'],
  generalInspection: ['general inspection'],
  other: ['other'],
};

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * The `services_types` row for a key, or `null` if the catalogue has no
 * equivalent. Use this to *look up* — filtering by a service the catalogue
 * does not have must match nothing, not everything under "Other".
 */
export async function findServiceTypeId(key?: string): Promise<number | null> {
  if (!key) return null;

  const options = await listServiceTypes();
  if (options.length === 0) return null;

  const aliases = SERVICE_TYPE_ALIASES[key as ServiceTypeKey] ?? [normalizeName(key)];
  const match = options.find((option) => aliases.includes(normalizeName(option.name)));

  return match ? Number(match.id) : null;
}

/**
 * The `services_types` row to *write* for a key.
 *
 * Falls back to the catalogue's "Other" row when the app knows a service the
 * project does not — `maintenance.service_type` is `not null`, so refusing to
 * map would mean refusing to save the record at all. The record reads back as
 * `other`, which is lossy; section 7 of the migration adds the missing rows.
 */
export async function resolveServiceTypeId(key?: string): Promise<number | null> {
  if (!key) return null;

  const exact = await findServiceTypeId(key);
  if (exact != null) return exact;

  const options = await listServiceTypes();
  const fallback = options.find((option) => normalizeName(option.name) === 'other');

  return fallback ? Number(fallback.id) : null;
}

export async function resolveServiceTypeName(id?: number | null): Promise<string> {
  if (id == null) return '';

  const options = await listServiceTypes();
  return options.find((option) => option.id === String(id))?.name ?? '';
}

/**
 * Maps a `services_types.name` back onto a `ServiceTypeKey`.
 *
 * Anything the app has no translation for — "Timing Belt", say — lands on
 * `other` rather than rendering a raw catalogue string where a translated
 * label belongs.
 */
export async function resolveServiceTypeKey(id?: number | null): Promise<ServiceTypeKey> {
  const name = await resolveServiceTypeName(id);
  if (!name) return 'other';

  const needle = normalizeName(name);
  const entry = (Object.entries(SERVICE_TYPE_ALIASES) as [ServiceTypeKey, string[]][]).find(
    ([, aliases]) => aliases.includes(needle)
  );

  return entry ? entry[0] : 'other';
}

/* ── Tips ─────────────────────────────────────────────────────────────────── */

export async function listTips(screen?: TipScreen): Promise<Tip[]> {
  if (!isLive('reference')) return delay([], 80);

  let query = supabase
    .from(TABLES.tips)
    .select('id, title, description, screen, type, is_seen')
    .order('created_at', { ascending: false });

  if (screen) query = query.eq('screen', screen);

  const rows = unwrapRaw<
    {
      id: number;
      title: string;
      description: string | null;
      screen: TipScreen;
      type: 'tip' | 'alert';
      is_seen: boolean | null;
    }[]
  >(await query);

  return rows.map((row) => ({
    id: toDomainId(row.id),
    title: row.title,
    description: row.description ?? undefined,
    screen: row.screen,
    type: row.type,
    isSeen: row.is_seen ?? false,
  }));
}
