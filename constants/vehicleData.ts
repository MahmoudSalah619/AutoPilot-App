import store from '@/redux';

export const VEHICLE_ID = store.getState().auth?.userData?.user?.vehicle?.vehicleId;
