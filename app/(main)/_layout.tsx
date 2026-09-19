import React from 'react';
import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/hooks/useSession';
import { useTheme } from '@/theme';

/**
 * Main stack. Screens render their own `ScreenHeader`, so the native header
 * stays off everywhere and back navigation is consistent across the app.
 *
 * Guards the whole authenticated area: a session that ends while the user is
 * several screens deep — an expired refresh token, a sign-out from another
 * device — unwinds to the welcome screen instead of leaving the shell up
 * over requests that will all come back 401.
 */
export default function MainLayout() {
  const { colors } = useTheme();
  const { isHydrated, isAuthenticated } = useSession();

  if (isHydrated && !isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

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
