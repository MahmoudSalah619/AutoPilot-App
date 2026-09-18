/**
 * AutoPilot design tokens — spacing, radii, elevation, motion.
 *
 * A 4pt spacing grid. Components consume `SPACING.md`, never a bare `16`.
 */

import { Platform, ViewStyle } from 'react-native';

export const SPACING = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  /** Standard screen side gutter. */
  screen: 16,
} as const;

export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

/** Minimum tappable size — below this, touch targets fail accessibility. */
export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };
export const MIN_TOUCH_TARGET = 44;

export const DURATION = {
  fast: 150,
  base: 220,
  slow: 320,
} as const;

/**
 * Elevation presets. iOS gets real shadows, Android gets `elevation`;
 * `shadowColor` is passed in so dark mode can deepen it.
 */
export const ELEVATION = {
  none: (): ViewStyle => ({}),

  sm: (shadowColor: string, isDark = false): ViewStyle =>
    Platform.select<ViewStyle>({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.4 : 0.06,
        shadowRadius: 3,
      },
      default: { elevation: 1 },
    })!,

  md: (shadowColor: string, isDark = false): ViewStyle =>
    Platform.select<ViewStyle>({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.5 : 0.08,
        shadowRadius: 10,
      },
      default: { elevation: 3 },
    })!,

  lg: (shadowColor: string, isDark = false): ViewStyle =>
    Platform.select<ViewStyle>({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDark ? 0.6 : 0.12,
        shadowRadius: 22,
      },
      default: { elevation: 8 },
    })!,
} as const;

export type SpacingToken = keyof typeof SPACING;
export type RadiusToken = keyof typeof RADIUS;
export type ElevationToken = keyof typeof ELEVATION;
