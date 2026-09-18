import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { autopilotApi } from '@/apis/autopilotApi';
import appReducer from './appReducer';
import authReducer from './authReducer';

const store = configureStore({
  reducer: {
    [autopilotApi.reducerPath]: autopilotApi.reducer,
    auth: authReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(autopilotApi.middleware),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/** Typed `useDispatch`, so thunks and mutations keep their inference. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/** Typed `useSelector`, so `state` is never `unknown` at the call site. */
export const useAppSelector = useSelector.withTypes<RootState>();
