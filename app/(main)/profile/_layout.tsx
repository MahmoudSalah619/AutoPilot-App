import React from 'react';
import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

/**
 * Profile stack. Each screen renders its own `ScreenHeader`, which is what
 * gives these sub-screens a working back button.
 */
export default function ProfileLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
