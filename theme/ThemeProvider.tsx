import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS, type ColorScheme } from '@/constants/Colors';
import { ELEVATION, RADIUS, SPACING } from '@/constants/Layout';
import { TYPOGRAPHY } from '@/constants/Typography';
import type { ThemeContextValue, ThemePreference } from './types';

const STORAGE_KEY = 'autopilot.theme-preference';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

/**
 * Owns the app's color scheme.
 *
 * Reads the user's stored preference once on mount and falls back to the OS
 * setting. Everything downstream reads through `useTheme()`, so a change here
 * re-renders the whole tree — which is exactly what the old module-scope
 * `Appearance.getColorScheme()` snapshot could never do.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!cancelled && isThemePreference(stored)) setPreferenceState(stored);
      })
      .catch(() => {
        /* A missing preference is not an error — `system` is a fine default. */
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const scheme: ColorScheme =
    preference === 'system' ? ((systemScheme ?? 'light') as ColorScheme) : preference;

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = scheme === 'dark';
    const colors = COLORS[scheme];

    return {
      scheme,
      isDark,
      colors,
      spacing: SPACING,
      radius: RADIUS,
      typography: TYPOGRAPHY,
      elevation: {
        none: () => ELEVATION.none(),
        sm: () => ELEVATION.sm(colors.shadow, isDark),
        md: () => ELEVATION.md(colors.shadow, isDark),
        lg: () => ELEVATION.lg(colors.shadow, isDark),
      },
      preference,
      setPreference,
      isReady,
    };
  }, [scheme, preference, setPreference, isReady]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
