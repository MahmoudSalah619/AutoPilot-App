import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as Updates from 'expo-updates';

import IMPORTANT_VARS from '@/constants/ImportantVars';

export type UpdateKind = 'none' | 'over-the-air' | 'store';

/**
 * Checks for updates on launch.
 *
 * Two distinct cases, surfaced separately because the user's options differ:
 *  - an OTA update, which is already downloaded and only needs a reload;
 *  - a forced store update, which can only be resolved by leaving the app.
 *
 * Returns state rather than firing `Alert.alert`, so the prompt is rendered
 * with the app's own themed dialog.
 */
export function useAppUpdates() {
  const [updateKind, setUpdateKind] = useState<UpdateKind>('none');

  useEffect(() => {
    if (IMPORTANT_VARS.forceStoreUpdate) {
      setUpdateKind('store');
      return;
    }

    // Updates are not served in development, so skip the round trip entirely.
    if (__DEV__) return;

    let cancelled = false;

    (async () => {
      try {
        const check = await Updates.checkForUpdateAsync();
        if (!check.isAvailable || cancelled) return;

        await Updates.fetchUpdateAsync();
        if (!cancelled) setUpdateKind('over-the-air');
      } catch {
        // An unreachable update server must never block app start.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const applyUpdate = useCallback(async () => {
    if (updateKind === 'store') {
      const url =
        Platform.OS === 'ios' ? IMPORTANT_VARS.iosStoreLink : IMPORTANT_VARS.androidStoreLink;

      Linking.openURL(url).catch(() => {});
      return;
    }

    try {
      await Updates.reloadAsync();
    } catch {
      setUpdateKind('none');
    }
  }, [updateKind]);

  return {
    updateKind,
    isUpdateAvailable: updateKind !== 'none',
    /** Store updates are mandatory, so they cannot be dismissed. */
    isDismissible: updateKind === 'over-the-air',
    dismiss: () => setUpdateKind('none'),
    applyUpdate,
  };
}

export default useAppUpdates;
