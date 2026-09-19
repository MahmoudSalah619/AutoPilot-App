import { useCallback, useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AUTH_REDIRECTS, isLive } from '@/apis/config';
import { exchangeAuthCode } from '@/apis/repositories/account';
import { toast } from '@/shared/components/ui/Toast';

/** Path of an `autopilot://…` redirect, without leading or trailing slashes. */
function pathOf(url: string): string {
  return (Linking.parse(url).path ?? '').replace(/^\/+|\/+$/g, '');
}

function pathOfRedirect(redirect: string): string {
  return pathOf(redirect);
}

/**
 * Handles the deep links Supabase sends people back on from an email.
 *
 * Both the sign-up confirmation and the password recovery link arrive as a
 * bare `?code=…` under PKCE, so the path is what distinguishes them:
 * `auth/callback` signs the user in, `auth/reset-password` establishes the
 * recovery session and hands over to the set-a-new-password screen.
 *
 * Mounted once, at the root, and covers both a cold start from a link
 * (`getInitialURL`) and a link opened while the app is already running.
 */
export function useAuthDeepLinks() {
  const { t } = useTranslation();

  // Expo delivers the initial URL to the listener as well on some platforms,
  // and a code is single-use — exchanging twice fails and shows the user a
  // spurious "link expired".
  const handled = useRef(new Set<string>());

  const handleUrl = useCallback(
    async (url: string | null) => {
      if (!url || handled.current.has(url)) return;

      const path = pathOf(url);
      const isConfirm = path === pathOfRedirect(AUTH_REDIRECTS.confirm);
      const isRecovery = path === pathOfRedirect(AUTH_REDIRECTS.recovery);
      if (!isConfirm && !isRecovery) return;

      handled.current.add(url);

      const params = Linking.parse(url).queryParams ?? {};
      const code = typeof params.code === 'string' ? params.code : undefined;
      const errorDescription =
        typeof params.error_description === 'string' ? params.error_description : undefined;

      if (errorDescription) {
        toast.error(t('auth.errors.linkExpired'), errorDescription);
        router.replace('/(auth)/login');
        return;
      }

      if (!code) return;

      try {
        await exchangeAuthCode(code);

        if (isRecovery) {
          router.replace('/(auth)/reset-password');
          return;
        }

        toast.success(t('auth.emailConfirmed'));
        router.replace('/(main)/(tabs)/Home');
      } catch (error) {
        const message = (error as { message?: string })?.message ?? 'auth.errors.linkExpired';
        toast.error(t('auth.errors.linkExpired'), t(message, { defaultValue: message }));
        router.replace('/(auth)/login');
      }
    },
    [t]
  );

  useEffect(() => {
    if (!isLive('auth')) return;

    Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));

    return () => subscription.remove();
  }, [handleUrl]);
}

export default useAuthDeepLinks;
