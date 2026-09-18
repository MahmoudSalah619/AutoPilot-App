import { useEffect, useMemo } from 'react';

import { useGetVehiclesQuery } from '@/apis/autopilotApi';
import { setActiveVehicle } from '@/redux/appReducer';
import { useAppDispatch, useAppSelector } from '@/redux';
import type { Vehicle } from '@/@types/models';

/**
 * The vehicle every screen is currently scoped to.
 *
 * Falls back to the primary vehicle, then the first one, and self-heals if the
 * stored selection points at a vehicle that has since been deleted.
 */
export function useActiveVehicle() {
  const dispatch = useAppDispatch();
  const activeVehicleId = useAppSelector((state) => state.app.activeVehicleId);
  const { data: vehicles = [], isLoading, isFetching, refetch } = useGetVehiclesQuery();

  const vehicle = useMemo<Vehicle | undefined>(() => {
    if (vehicles.length === 0) return undefined;

    return (
      vehicles.find((candidate) => candidate.id === activeVehicleId) ??
      vehicles.find((candidate) => candidate.isPrimary) ??
      vehicles[0]
    );
  }, [vehicles, activeVehicleId]);

  useEffect(() => {
    if (vehicle && vehicle.id !== activeVehicleId) {
      dispatch(setActiveVehicle(vehicle.id));
    }
  }, [vehicle, activeVehicleId, dispatch]);

  return {
    vehicle,
    vehicleId: vehicle?.id,
    vehicles,
    hasVehicle: vehicles.length > 0,
    isLoading,
    isFetching,
    refetch,
    selectVehicle: (id: string) => dispatch(setActiveVehicle(id)),
  };
}

export default useActiveVehicle;
