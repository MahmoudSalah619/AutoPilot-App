import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AppState {
  /** Vehicle the whole app is currently scoped to. */
  activeVehicleId: string | null;
  deviceId: string | null;
  /** Expo push token, registered once permissions are granted. */
  pushToken: string | null;
  /**
   * Whether the biometric app lock has been satisfied this launch. Never
   * persisted — the point of the lock is that it is asked again on a cold
   * start.
   */
  isUnlocked: boolean;
}

const initialState: AppState = {
  activeVehicleId: null,
  deviceId: null,
  pushToken: null,
  isUnlocked: false,
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
    unlocked: (state) => {
      state.isUnlocked = true;
    },
    locked: (state) => {
      state.isUnlocked = false;
    },
  },
});

export const { setActiveVehicle, setDeviceId, setPushToken, unlocked, locked } = appSlice.actions;

export default appSlice.reducer;
