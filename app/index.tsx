import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';

import { useSession } from '@/hooks/useSession';
import { useAppSelector } from '@/redux';
import { isAppLockEnabled } from '@/features/auth';
import { useTheme } from '@/theme';
import { Loading } from '@/shared/components/ui';

/**
 * Entry route. Decides where a launch lands once the persisted session has
 * been checked, and shows nothing but a spinner until then.
 */
export default function Index() {
  const { isHydrated, isAuthenticated } = useSession();
  const isUnlocked = useAppSelector((state) => state.app.isUnlocked);
  const { colors } = useTheme();

  // Read from storage, so it starts unknown rather than false — defaulting
  // to false would flash the Home screen before the lock could take effect.
  const [isLockEnabled, setIsLockEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    isAppLockEnabled().then((enabled) => {
      if (!cancelled) setIsLockEnabled(enabled);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isHydrated || isLockEnabled === null) {
    return (
      <View style={{ backgroundColor: colors.background, flex: 1 }}>
        <Loading />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (isLockEnabled && !isUnlocked) {
    return <Redirect href="/(auth)/unlock" />;
  }

  return <Redirect href="/(main)/(tabs)/Home" />;
}
