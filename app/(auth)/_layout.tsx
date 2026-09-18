import React from 'react';
import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome/index" options={{ gestureEnabled: false }} />
      <Stack.Screen name="login/index" />
      <Stack.Screen name="signup/index" />
      <Stack.Screen name="forgot-password/index" />
      <Stack.Screen name="addVehicle/index" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
