import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import { SPACING } from '@/constants/Layout';
import { useSignOutMutation } from '@/apis/autopilotApi';
import { useBiometricLogin } from '@/hooks/useBiometricLogin';
import { sessionEnded } from '@/redux/authReducer';
import { unlocked } from '@/redux/appReducer';
import { useAppDispatch } from '@/redux';
import { useTheme } from '@/theme';
import { Screen } from '@/shared/components/layout';
import { Button, Logo, Text } from '@/shared/components/ui';

/**
 * Biometric gate over an already-valid session.
 *
 * Reached from the entry route when the device has the app lock switched on
 * and a session was restored. It is deliberately *not* a way to sign in: the
 * session already exists and is already authenticated: this only decides
 * whether to reveal it. Someone who cannot pass the biometric can still sign
 * out and use their password, which is the real credential.
 */
export default function Unlock() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const [signOut] = useSignOutMutation();

  const { isBiometricSupported, isAuthenticated, isChecking, runBiometric } = useBiometricLogin();
  const [hasPrompted, setHasPrompted] = useState(false);

  // Prompt straight away: making the user tap a button to reach the system
  // sheet is a step with no decision in it.
  useEffect(() => {
    if (hasPrompted || !isBiometricSupported) return;

    setHasPrompted(true);
    runBiometric();
  }, [hasPrompted, isBiometricSupported, runBiometric]);

  useEffect(() => {
    if (!isAuthenticated) return;

    dispatch(unlocked());
    router.replace('/(main)/(tabs)/Home');
  }, [isAuthenticated, dispatch]);

  // Biometrics removed from the device after the lock was enabled would
  // otherwise strand the user on this screen with no way forward.
  useEffect(() => {
    if (isBiometricSupported) return;

    dispatch(unlocked());
    router.replace('/(main)/(tabs)/Home');
  }, [isBiometricSupported, dispatch]);

  const handleUsePassword = async () => {
    try {
      await signOut().unwrap();
    } finally {
      dispatch(sessionEnded());
      router.replace('/(auth)/login');
    }
  };

  return (
    <Screen>
      <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center', rowGap: SPACING.xl }}>
        <Logo size={72} />

        <View style={{ alignItems: 'center', rowGap: SPACING.xs }}>
          <Text variant="h1" tx="auth.lockedTitle" />
          <Text
            variant="body"
            color="textSecondary"
            tx="auth.lockedBody"
            style={{ textAlign: 'center' }}
          />
        </View>

        <Button
          size="lg"
          fullWidth
          tx="auth.unlock"
          loading={isChecking}
          leftIcon={<Feather name="unlock" size={18} color={colors.onPrimary} />}
          onPress={runBiometric}
        />

        <Button variant="ghost" tx="auth.usePasswordInstead" onPress={handleUsePassword} />
      </View>
    </Screen>
  );
}
