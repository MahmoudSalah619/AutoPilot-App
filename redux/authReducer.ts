import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  accessToken: string | null;
  userId: string | null;
  email: string | null;
  /** True once the persisted session has been checked on boot. */
  isHydrated: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  userId: null,
  email: null,
  isHydrated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionStarted: (
      state,
      action: PayloadAction<{ userId: string; email: string; accessToken?: string }>
    ) => {
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.accessToken = action.payload.accessToken ?? null;
      state.isHydrated = true;
    },
    sessionEnded: () => ({ ...initialState, isHydrated: true }),
    hydrationFinished: (state) => {
      state.isHydrated = true;
    },
  },
});

export const { sessionStarted, sessionEnded, hydrationFinished } = authSlice.actions;

export default authSlice.reducer;
