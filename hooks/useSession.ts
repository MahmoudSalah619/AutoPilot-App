import { useCallback, useEffect } from 'react';

import { autopilotApi } from '@/apis/autopilotApi';
import { isLive } from '@/apis/config';
import { getSession } from '@/apis/repositories/account';
import { resetReferenceCache } from '@/apis/repositories/reference';
import { supabase } from '@/apis/supabaseClient';
import { hydrationFinished, sessionEnded, sessionStarted } from '@/redux/authReducer';
import { setActiveVehicle } from '@/redux/appReducer';
import { useAppDispatch, useAppSelector } from '@/redux';

/**
 * Reads the current session from Redux.
 *
 * Pure: it never fetches. `useAuthBootstrap` owns the lifecycle, so this can
 * be called from as many screens as need it without duplicating work.
 */
export function useSession() {
  const auth = useAppSelector((state) => state.auth);

  return {
    isHydrated: auth.isHydrated,
    isAuthenticated: Boolean(auth.userId),
    userId: auth.userId,
    email: auth.email,
  };
}

/**
 * Restores a persisted session on boot and tracks it thereafter.
 *
 * Mounted once, at the root. Supabase keeps the session in AsyncStorage and
 * refreshes it itself, so the initial read only has to happen once. The
 * subscription is what matters after that: a refresh failure, a password
 * change or a sign-out from elsewhere has to reach Redux, otherwise the UI
 * keeps rendering an authenticated shell over a dead token.
 */
export function useAuthBootstrap() {
  const dispatch = useAppDispatch();
  const isHydrated = useAppSelector((state) => state.auth.isHydrated);
  const userId = useAppSelector((state) => state.auth.userId);

  /** Drops everything cached for the user who is on their way out. */
  const clearUserScopedState = useCallback(() => {
    resetReferenceCache();
    dispatch(autopilotApi.util.resetApiState());
    dispatch(setActiveVehicle(null));
  }, [dispatch]);

  useEffect(() => {
    if (isHydrated) return;

    let cancelled = false;

    getSession()
      .then((session) => {
        if (cancelled) return;

        if (session) {
          dispatch(sessionStarted(session));
        } else {
          dispatch(hydrationFinished());
        }
      })
      .catch(() => {
        if (!cancelled) dispatch(sessionEnded());
      });

    return () => {
      cancelled = true;
    };
  }, [isHydrated, dispatch]);

  useEffect(() => {
    if (!isLive('auth')) return;

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        clearUserScopedState();
        dispatch(sessionEnded());
        return;
      }

      // A different user signing in on the same device must not inherit the
      // previous one's cache.
      if (userId && session.user.id !== userId) {
        clearUserScopedState();
      }

      dispatch(
        sessionStarted({
          userId: session.user.id,
          email: session.user.email ?? '',
          accessToken: session.access_token,
        })
      );
    });

    return () => data.subscription.unsubscribe();
  }, [userId, clearUserScopedState, dispatch]);
}

export default useSession;
