import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useTheme } from '@/theme';
import { useBiometricLogin } from '@/hooks/useBiometricLogin';
import { Button } from '@/shared/components/ui';

/**
 * Biometric sign-in shortcut.
 *
 * Renders nothing when the device has no biometric hardware, rather than
 * showing a button that cannot work.
 */
export default function BiometricAuth() {
  const { colors } = useTheme();
  const { isBiometricSupported, isAuthenticated, runBiometric, isChecking } = useBiometricLogin();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(main)/(tabs)/Home');
    }
  }, [isAuthenticated]);

  if (!isBiometricSupported) return null;

  return (
    <View>
      <Button
        variant="outline"
        size="lg"
        fullWidth
        tx="auth.biometricPrompt"
        loading={isChecking}
        leftIcon={<Feather name="unlock" size={18} color={colors.text} />}
        onPress={runBiometric}
      />
    </View>
  );
}
