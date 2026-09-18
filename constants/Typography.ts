/**
 * AutoPilot design tokens — typography.
 *
 * A closed set of named text roles. Screens pick a `variant`; they never
 * hand-pick a font size and weight. That is what keeps headings on one screen
 * identical to headings on another.
 */

import { TextStyle } from 'react-native';
import FontFamily from './FontFamily';

export const TYPOGRAPHY = {
  /** Screen-level hero text. One per screen, at most. */
  displayLg: {
    fontFamily: FontFamily.cosmica_700,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  /** Default screen title. */
  display: {
    fontFamily: FontFamily.cosmica_700,
    fontSize: 27,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  /** Card / major section heading. */
  h1: {
    fontFamily: FontFamily.cosmica_700,
    fontSize: 22,
    lineHeight: 29,
    letterSpacing: -0.2,
  },
  h2: {
    fontFamily: FontFamily.cosmica_600,
    fontSize: 18,
    lineHeight: 25,
    letterSpacing: -0.1,
  },
  h3: {
    fontFamily: FontFamily.cosmica_600,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  },

  /** Long-form body copy. */
  bodyLg: {
    fontFamily: FontFamily.cosmica_400,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  body: {
    fontFamily: FontFamily.cosmica_400,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0,
  },
  bodySm: {
    fontFamily: FontFamily.cosmica_400,
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0,
  },

  /** Form labels, buttons, tabs — anything that names a control. */
  label: {
    fontFamily: FontFamily.cosmica_600,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  labelSm: {
    fontFamily: FontFamily.cosmica_600,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },

  /** Timestamps, helper text, footnotes. */
  caption: {
    fontFamily: FontFamily.cosmica_400,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },

  /** Small all-caps section eyebrow. */
  overline: {
    fontFamily: FontFamily.cosmica_700,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },

  /** Big readouts: odometer, km/L, totals. */
  metricLg: {
    fontFamily: FontFamily.cosmica_700,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  metric: {
    fontFamily: FontFamily.cosmica_700,
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  metricSm: {
    fontFamily: FontFamily.cosmica_600,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof TYPOGRAPHY;

/** Font weight → loaded family name, for the rare case a variant needs overriding. */
export const WEIGHT_TO_FAMILY = {
  300: FontFamily.cosmica_300,
  400: FontFamily.cosmica_400,
  500: FontFamily.cosmica_500,
  600: FontFamily.cosmica_600,
  700: FontFamily.cosmica_700,
  800: FontFamily.cosmica_800,
} as const;

export type FontWeightToken = keyof typeof WEIGHT_TO_FAMILY;

export default TYPOGRAPHY;
