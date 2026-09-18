import type { ThemeColors, ColorScheme } from '@/constants/Colors';
import type { SPACING, RADIUS, ELEVATION } from '@/constants/Layout';
import type { TYPOGRAPHY } from '@/constants/Typography';

/** How the user wants the app themed. `system` follows the OS setting. */
export type ThemePreference = 'system' | 'light' | 'dark';

export interface Theme {
  /** The resolved scheme actually in effect right now. */
  scheme: ColorScheme;
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof SPACING;
  radius: typeof RADIUS;
  typography: typeof TYPOGRAPHY;
  /** Elevation presets already bound to this theme's shadow color. */
  elevation: {
    [K in keyof typeof ELEVATION]: () => ReturnType<(typeof ELEVATION)[K]>;
  };
}

export interface ThemeContextValue extends Theme {
  /** The user's stored choice, which may be `system`. */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** True until the stored preference has been read from disk. */
  isReady: boolean;
}
