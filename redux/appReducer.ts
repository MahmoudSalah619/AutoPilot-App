import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AppState {
  /** Vehicle the whole app is currently scoped to. */
  activeVehicleId: string | null;
  deviceId: string | null;
  /** Expo push token, registered once permissions are granted. */
  pushToken: string | null;
}

const initialState: AppState = {
  activeVehicleId: null,
  deviceId: null,
  pushToken: null,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveVehicle: (state, action: PayloadAction<string | null>) => {
      state.activeVehicleId = action.payload;
    },
    setDeviceId: (state, action: PayloadAction<string>) => {
      state.deviceId = action.payload;
    },
    setPushToken: (state, action: PayloadAction<string | null>) => {
      state.pushToken = action.payload;
    },
  },
});

export const { setActiveVehicle, setDeviceId, setPushToken } = appSlice.actions;

export default appSlice.reducer;
