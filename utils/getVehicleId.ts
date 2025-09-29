import store from '@/redux';

/**
 * Gets the current user's vehicle ID from Redux store
 * @returns Vehicle ID string or undefined if not available
 * @throws Error if vehicle ID is not found (when requireVehicleId is true)
 */
export const getVehicleId = (requireVehicleId: boolean = true): string | undefined => {
  const state = store.getState();
  const vehicleId = state.auth?.userData?.user?.vehicle?.vehicleId;
  const isLoggedIn = !!state.auth?.token;

  if (requireVehicleId && !vehicleId && isLoggedIn) {
    throw new Error('Vehicle ID not found. Please ensure user is logged in and has a vehicle.');
  }

  return vehicleId;
};

/**
 * Gets the current user's vehicle ID without throwing error
 * @returns Vehicle ID string or undefined if not available
 */
export const getVehicleIdSafe = (): string | undefined => {
  return getVehicleId(false);
};
