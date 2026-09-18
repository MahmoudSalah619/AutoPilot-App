import dayjs from 'dayjs';

import { TABLES, USE_MOCK_DATA } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { Trip } from '@/@types/models';
import { byDateAsc, RepositoryError, toRow, unwrap } from './helpers';

export type TripDraft = Omit<Trip, 'id' | 'createdAt' | 'checklist'> &
  Partial<Pick<Trip, 'checklist'>>;

/** Pre-departure checks offered on every new trip. */
export const DEFAULT_TRIP_CHECKLIST = [
  'trips.checklist.tirePressure',
  'trips.checklist.oilLevel',
  'trips.checklist.coolant',
  'trips.checklist.brakes',
  'trips.checklist.lights',
  'trips.checklist.spareTire',
  'trips.checklist.documents',
  'trips.checklist.firstAid',
] as const;

export async function listTrips(vehicleId?: string): Promise<Trip[]> {
  if (USE_MOCK_DATA) {
    const trips = db.trips.filter((trip) => !vehicleId || trip.vehicleId === vehicleId);
    return delay(byDateAsc(trips, 'departureDate'));
  }

  let query = supabase.from(TABLES.trips).select('*');
  if (vehicleId) query = query.eq('vehicle_id', vehicleId);

  return unwrap<Trip[]>(await query.order('departure_date', { ascending: true }));
}

export async function getTrip(id: string): Promise<Trip> {
  if (USE_MOCK_DATA) {
    const found = db.trips.find((trip) => trip.id === id);
    if (!found) throw new RepositoryError('Trip not found', 404);
    return delay(found);
  }

  return unwrap<Trip>(await supabase.from(TABLES.trips).select('*').eq('id', id).single());
}

export async function createTrip(draft: TripDraft): Promise<Trip> {
  const checklist =
    draft.checklist ??
    DEFAULT_TRIP_CHECKLIST.map((labelKey, index) => ({
      id: `chk-${index}`,
      labelKey,
      isDone: false,
    }));

  if (USE_MOCK_DATA) {
    const trip: Trip = {
      ...draft,
      checklist,
      id: mockId('trip'),
      createdAt: dayjs().toISOString(),
    };

    db.trips.unshift(trip);
    return delay(trip);
  }

  return unwrap<Trip>(
    await supabase
      .from(TABLES.trips)
      .insert(toRow({ ...draft, checklist }))
      .select()
      .single()
  );
}

export async function updateTrip(id: string, patch: Partial<TripDraft>): Promise<Trip> {
  if (USE_MOCK_DATA) {
    const index = db.trips.findIndex((trip) => trip.id === id);
    if (index === -1) throw new RepositoryError('Trip not found', 404);

    db.trips[index] = { ...db.trips[index], ...patch } as Trip;
    return delay(db.trips[index]);
  }

  return unwrap<Trip>(
    await supabase.from(TABLES.trips).update(toRow(patch)).eq('id', id).select().single()
  );
}

/** Toggles one pre-departure check. */
export async function toggleTripChecklistItem(tripId: string, itemId: string): Promise<Trip> {
  const trip = await getTrip(tripId);

  const checklist = trip.checklist.map((item) =>
    item.id === itemId ? { ...item, isDone: !item.isDone } : item
  );

  return updateTrip(tripId, { checklist });
}

export async function deleteTrip(id: string): Promise<string> {
  if (USE_MOCK_DATA) {
    db.trips = db.trips.filter((trip) => trip.id !== id);
    return delay(id);
  }

  const { error } = await supabase.from(TABLES.trips).delete().eq('id', id);
  if (error) throw new RepositoryError(error.message);

  return id;
}
