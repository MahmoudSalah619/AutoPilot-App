import dayjs from 'dayjs';

import { isLive, TABLES } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { Vehicle } from '@/@types/models';
import {
  assertOk,
  compact,
  dateToYear,
  RepositoryError,
  toDomainId,
  toRowId,
  unwrapRaw,
  yearToDate,
} from './helpers';
import { requireUserId } from './account';
import { resolveMakeId, resolveMakeName } from './reference';

export type VehicleDraft = Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'isPrimary'> &
  Partial<Pick<Vehicle, 'isPrimary'>>;

/* ── Live-schema mapping ──────────────────────────────────────────────────── */

/**
 * A row of `public.vehicles` as it exists today.
 *
 * The table carries far less than the app's `Vehicle`: no nickname, plate,
 * VIN, colour, fuel type, transmission, tank capacity or photo. Those fields
 * are listed in `UNBACKED_FIELDS.vehicles` and come back undefined until the
 * migration adds them.
 */
interface VehicleRow {
  id: number;
  user_id: string;
  make: number | null;
  model: string | null;
  year: string | null;
  odometer: number | null;
  is_primary: boolean;
  created_at: string;
}

const VEHICLE_COLUMNS = 'id, user_id, make, model, year, odometer, is_primary, created_at';

async function fromVehicleRow(row: VehicleRow): Promise<Vehicle> {
  return {
    id: toDomainId(row.id),
    userId: row.user_id,
    make: await resolveMakeName(row.make),
    model: row.model ?? '',
    year: dateToYear(row.year) ?? 0,
    odometer: Number(row.odometer ?? 0),
    isPrimary: row.is_primary,
    createdAt: row.created_at,
    // Not stored by the current schema; declared so the shape stays complete.
    fuelType: 'petrol',
  };
}

async function toVehicleRow(draft: Partial<VehicleDraft>): Promise<Record<string, unknown>> {
  return compact({
    make: draft.make !== undefined ? await resolveMakeId(draft.make) : undefined,
    model: draft.model,
    year: draft.year !== undefined ? yearToDate(draft.year) : undefined,
    odometer: draft.odometer,
    is_primary: draft.isPrimary,
  });
}

/**
 * Demotes every other vehicle so exactly one stays primary.
 *
 * The column has no partial unique index behind it, so the invariant has to
 * be maintained here — two primaries would make `useActiveVehicle` pick an
 * arbitrary one on every launch.
 */
async function demoteOthers(userId: string, keepId?: number): Promise<void> {
  let query = supabase
    .from(TABLES.vehicles)
    .update({ is_primary: false })
    .eq('user_id', userId)
    .eq('is_primary', true);

  if (keepId != null) query = query.neq('id', keepId);

  assertOk(await query);
}

/* ── Queries ──────────────────────────────────────────────────────────────── */

export async function listVehicles(): Promise<Vehicle[]> {
  if (!isLive('vehicles')) {
    return delay(db.vehicles);
  }

  const rows = unwrapRaw<VehicleRow[]>(
    await supabase
      .from(TABLES.vehicles)
      .select(VEHICLE_COLUMNS)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })
  );

  return Promise.all(rows.map(fromVehicleRow));
}

export async function getVehicle(id: string): Promise<Vehicle> {
  if (!isLive('vehicles')) {
    const found = db.vehicles.find((vehicle) => vehicle.id === id);
    if (!found) throw new RepositoryError('Vehicle not found', 404);
    return delay(found);
  }

  const row = unwrapRaw<VehicleRow>(
    await supabase.from(TABLES.vehicles).select(VEHICLE_COLUMNS).eq('id', toRowId(id)).single()
  );

  return fromVehicleRow(row);
}

export async function createVehicle(draft: VehicleDraft): Promise<Vehicle> {
  if (!isLive('vehicles')) {
    const vehicle: Vehicle = {
      ...draft,
      id: mockId('vehicle'),
      userId: db.profile.id,
      isPrimary: draft.isPrimary ?? db.vehicles.length === 0,
      createdAt: dayjs().toISOString(),
    };

    if (vehicle.isPrimary) {
      db.vehicles.forEach((existing) => {
        existing.isPrimary = false;
      });
    }

    db.vehicles.unshift(vehicle);
    return delay(vehicle);
  }

  const userId = await requireUserId();

  // A user's first vehicle is primary by default, so the app always has
  // something to scope to without an extra round trip from the UI.
  const { count } = await supabase
    .from(TABLES.vehicles)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  const isPrimary = draft.isPrimary ?? (count ?? 0) === 0;

  if (isPrimary) await demoteOthers(userId);

  const row = unwrapRaw<VehicleRow>(
    await supabase
      .from(TABLES.vehicles)
      .insert({ ...(await toVehicleRow(draft)), user_id: userId, is_primary: isPrimary })
      .select(VEHICLE_COLUMNS)
      .single()
  );

  return fromVehicleRow(row);
}

export async function updateVehicle(id: string, patch: Partial<VehicleDraft>): Promise<Vehicle> {
  if (!isLive('vehicles')) {
    const index = db.vehicles.findIndex((vehicle) => vehicle.id === id);
    if (index === -1) throw new RepositoryError('Vehicle not found', 404);

    if (patch.isPrimary) {
      db.vehicles.forEach((existing) => {
        existing.isPrimary = false;
      });
    }

    db.vehicles[index] = { ...db.vehicles[index], ...patch };
    return delay(db.vehicles[index]);
  }

  const rowId = toRowId(id);

  if (patch.isPrimary) {
    await demoteOthers(await requireUserId(), rowId);
  }

  const row = unwrapRaw<VehicleRow>(
    await supabase
      .from(TABLES.vehicles)
      .update(await toVehicleRow(patch))
      .eq('id', rowId)
      .select(VEHICLE_COLUMNS)
      .single()
  );

  return fromVehicleRow(row);
}

/**
 * Records a new odometer reading.
 *
 * Rejects a value lower than the stored one — odometers do not run backwards,
 * and silently accepting a typo would corrupt every distance calculation
 * downstream.
 *
 * The reading's timestamp is not persisted against the live schema: there is
 * no `odometer_updated_at` column, so `useOdometerNudge` falls back to
 * nudging on interval rather than on staleness.
 */
export async function updateOdometer(id: string, odometer: number): Promise<Vehicle> {
  if (!Number.isFinite(odometer) || odometer < 0) {
    throw new RepositoryError('validation.odometerInvalid', 400);
  }

  const current = await getVehicle(id);
  if (odometer < current.odometer) {
    throw new RepositoryError('validation.odometerBelowCurrent', 400);
  }

  if (!isLive('vehicles')) {
    return updateVehicle(id, {
      odometer,
      odometerUpdatedAt: dayjs().toISOString(),
    } as Partial<VehicleDraft>);
  }

  return updateVehicle(id, { odometer });
}

/**
 * Deletes a vehicle and everything hanging off it.
 *
 * The foreign keys pointing at `vehicles` are plain `no action` — there is no
 * `on delete cascade` on any of them — so deleting a vehicle that has history
 * fails with a constraint violation. Clearing the children first keeps the
 * delete working until the migration adds the cascade.
 */
const VEHICLE_CHILD_TABLES = [
  TABLES.maintenance,
  TABLES.serviceReminders,
  TABLES.gasConsumption,
  TABLES.vehicleDocuments,
] as const;

export async function deleteVehicle(id: string): Promise<string> {
  if (!isLive('vehicles')) {
    db.vehicles = db.vehicles.filter((vehicle) => vehicle.id !== id);
    return delay(id);
  }

  const rowId = toRowId(id);

  for (const table of VEHICLE_CHILD_TABLES) {
    assertOk(await supabase.from(table).delete().eq('vehicle_id', rowId));
  }

  assertOk(await supabase.from(TABLES.vehicles).delete().eq('id', rowId));

  return id;
}
