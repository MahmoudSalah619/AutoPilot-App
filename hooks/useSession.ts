import { useEffect } from 'react';

import { getSession } from '@/apis/repositories/account';
import { hydrationFinished, sessionEnded, sessionStarted } from '@/redux/authReducer';
import { useAppDispatch, useAppSelector } from '@/redux';

/**
 * Restores a persisted session on boot.
 *
 * Supabase keeps the session in AsyncStorage and refreshes it itself, so this
 * only has to ask for it once and mirror the result into Redux.
 */
export function useSession() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (auth.isHydrated) return;

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
  }, [auth.isHydrated, dispatch]);

  return {
    isHydrated: auth.isHydrated,
    isAuthenticated: Boolean(auth.userId),
    userId: auth.userId,
    email: auth.email,
  };
}

export default useSession;
