import React from 'react';
import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

/**
 * Main stack. Screens render their own `ScreenHeader`, so the native header
 * stays off everywhere and back navigation is consistent across the app.
 */
export default function MainLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="maintenance" />
      <Stack.Screen name="services" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="vehicle" />
    </Stack>
  );
}
