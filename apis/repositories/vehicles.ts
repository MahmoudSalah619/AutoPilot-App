import dayjs from 'dayjs';

import { TABLES, USE_MOCK_DATA } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { Vehicle } from '@/@types/models';
import { RepositoryError, toRow, unwrap } from './helpers';

export type VehicleDraft = Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'isPrimary'> &
  Partial<Pick<Vehicle, 'isPrimary'>>;

export async function listVehicles(): Promise<Vehicle[]> {
  if (USE_MOCK_DATA) {
    return delay(db.vehicles);
  }

  return unwrap<Vehicle[]>(
    await supabase
      .from(TABLES.vehicles)
      .select('*')
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })
  );
}

export async function getVehicle(id: string): Promise<Vehicle> {
  if (USE_MOCK_DATA) {
    const found = db.vehicles.find((vehicle) => vehicle.id === id);
    if (!found) throw new RepositoryError('Vehicle not found', 404);
    return delay(found);
  }

  return unwrap<Vehicle>(await supabase.from(TABLES.vehicles).select('*').eq('id', id).single());
}

export async function createVehicle(draft: VehicleDraft): Promise<Vehicle> {
  if (USE_MOCK_DATA) {
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

  const { data: session } = await supabase.auth.getUser();
  if (!session.user) throw new RepositoryError('Not authenticated', 401);

  return unwrap<Vehicle>(
    await supabase
      .from(TABLES.vehicles)
      .insert(toRow({ ...draft, userId: session.user.id }))
      .select()
      .single()
  );
}

export async function updateVehicle(id: string, patch: Partial<VehicleDraft>): Promise<Vehicle> {
  if (USE_MOCK_DATA) {
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

  return unwrap<Vehicle>(
    await supabase.from(TABLES.vehicles).update(toRow(patch)).eq('id', id).select().single()
  );
}

/**
 * Records a new odometer reading.
 *
 * Rejects a value lower than the stored one — odometers do not run backwards,
 * and silently accepting a typo would corrupt every distance calculation
 * downstream.
 */
export async function updateOdometer(id: string, odometer: number): Promise<Vehicle> {
  if (!Number.isFinite(odometer) || odometer < 0) {
    throw new RepositoryError('validation.odometerInvalid', 400);
  }

  const current = await getVehicle(id);
  if (odometer < current.odometer) {
    throw new RepositoryError('validation.odometerBelowCurrent', 400);
  }

  return updateVehicle(id, {
    odometer,
    odometerUpdatedAt: dayjs().toISOString(),
  } as Partial<VehicleDraft>);
}

export async function deleteVehicle(id: string): Promise<string> {
  if (USE_MOCK_DATA) {
    db.vehicles = db.vehicles.filter((vehicle) => vehicle.id !== id);
    return delay(id);
  }

  const { error } = await supabase.from(TABLES.vehicles).delete().eq('id', id);
  if (error) throw new RepositoryError(error.message);

  return id;
}
