import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import cosmica_300 from '@/assets/fonts/Cosmica-Light.otf';
import cosmica_400 from '@/assets/fonts/Cosmica-Regular.otf';
import cosmica_500 from '@/assets/fonts/Cosmica-Medium.otf';
import cosmica_600 from '@/assets/fonts/Cosmica-SemiBold.otf';
import cosmica_700 from '@/assets/fonts/Cosmica-Bold.otf';
import cosmica_800 from '@/assets/fonts/Cosmica-ExtraBold.otf';

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Loads fonts before the first render.
 *
 * The root layout renders nothing until this reports done, so no screen ever
 * flashes in a fallback system font.
 */
export function useLoadResources() {
  const [areResourcesLoaded, setAreResourcesLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await Font.loadAsync({
          cosmica_300,
          cosmica_400,
          cosmica_500,
          cosmica_600,
          cosmica_700,
          cosmica_800,
        });
      } catch (error) {
        // A missing font should degrade to the system face, not block the app.
        console.warn('Font loading failed', error);
      } finally {
        if (!cancelled) {
          setAreResourcesLoaded(true);
          SplashScreen.hideAsync().catch(() => {});
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { areResourcesLoaded };
}

export default useLoadResources;
