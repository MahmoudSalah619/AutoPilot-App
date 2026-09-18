import React from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';

import { useSession } from '@/hooks/useSession';
import { useTheme } from '@/theme';
import { Loading } from '@/shared/components/ui';

/**
 * Entry route. Decides where a launch lands once the persisted session has
 * been checked, and shows nothing but a spinner until then.
 */
export default function Index() {
  const { isHydrated, isAuthenticated } = useSession();
  const { colors } = useTheme();

  if (!isHydrated) {
    return (
      <View style={{ backgroundColor: colors.background, flex: 1 }}>
        <Loading />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(main)/(tabs)/Home' : '/(auth)/welcome'} />;
}
