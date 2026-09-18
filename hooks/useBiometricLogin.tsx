import { useCallback, useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';

import { toast } from '@/shared/components/ui/Toast';

/**
 * Device biometric authentication.
 *
 * Reports support as hardware *and* enrolment — a phone with a fingerprint
 * reader that has no finger registered cannot authenticate, so offering the
 * button would be a dead end.
 */
export function useBiometricLogin() {
  const { t } = useTranslation();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [hasHardware, isEnrolled] = await Promise.all([
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
        ]);

        if (!cancelled) setIsBiometricSupported(hasHardware && isEnrolled);
      } catch {
        if (!cancelled) setIsBiometricSupported(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const runBiometric = useCallback(async () => {
    setIsChecking(true);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('auth.biometricReason'),
        cancelLabel: t('common.cancel'),
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAuthenticated(true);
      }
    } catch {
      toast.error(t('errors.unexpected'));
    } finally {
      setIsChecking(false);
    }
  }, [t]);

  return { isBiometricSupported, isAuthenticated, isChecking, runBiometric };
}

export default useBiometricLogin;
