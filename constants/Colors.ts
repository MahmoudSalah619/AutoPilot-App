/**
 * AutoPilot design tokens — color.
 *
 * Single source of truth. Every color in the app resolves to a semantic token
 * here; no component should ever contain a raw hex value.
 *
 * Structure:
 *   - Semantic roles (`background`, `surface`, `text`, `primary`, …) so a token
 *     describes *what it is for*, never *what it looks like*.
 *   - `light` and `dark` are genuinely different palettes and must always
 *     declare the exact same key set — `ThemeColors` enforces that at compile time.
 *   - Prefer `useTheme().colors` in components; `COLORS[scheme]` is for
 *     non-reactive contexts (navigation options, style factories).
 */

/* ── Brand ramp ──────────────────────────────────────────────────────────── */
const BRAND = {
  50: '#FEF3EC',
  100: '#FDE0CE',
  200: '#FBC0A0',
  300: '#F89A6A',
  400: '#F4783C',
  500: '#EC5B13', // brand primary
  600: '#D24E0C',
  700: '#AE400A',
  800: '#83300A',
  900: '#5C2209',
};

/* ── Neutral (slate) ramp ────────────────────────────────────────────────── */
const SLATE = {
  0: '#FFFFFF',
  50: '#F7F8FA',
  100: '#F1F3F6',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  950: '#080C13',
};

export const light = {
  /* Surfaces — lowest to highest elevation */
  background: SLATE[50],
  backgroundElevated: SLATE[0],
  surface: SLATE[0],
  surfaceAlt: SLATE[100],
  surfaceSunken: SLATE[100],
  surfaceInverse: SLATE[900],

  /* Lines */
  border: SLATE[200],
  borderStrong: SLATE[300],
  divider: SLATE[200],

  /* Content */
  text: SLATE[900],
  textSecondary: SLATE[600],
  textMuted: SLATE[500],
  textDisabled: SLATE[400],
  textInverse: SLATE[0],

  /* Brand */
  primary: BRAND[500],
  primaryPressed: BRAND[600],
  primarySoft: BRAND[50],
  primaryBorder: BRAND[200],
  onPrimary: '#FFFFFF',

  /* Status */
  success: '#15803D',
  successSoft: '#ECFDF3',
  successBorder: '#BBF7D0',
  onSuccess: '#FFFFFF',

  warning: '#B45309',
  warningSoft: '#FFFBEB',
  warningBorder: '#FDE68A',
  onWarning: '#FFFFFF',

  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  dangerBorder: '#FECACA',
  onDanger: '#FFFFFF',

  info: '#1D4ED8',
  infoSoft: '#EFF6FF',
  infoBorder: '#BFDBFE',
  onInfo: '#FFFFFF',

  /* Accents — the fixed set used for category / service icons. Using tokens
     here (instead of one-off hexes per screen) keeps the grid coherent. */
  accentBlue: '#2563EB',
  accentBlueSoft: '#EFF6FF',
  accentTeal: '#0D9488',
  accentTealSoft: '#F0FDFA',
  accentViolet: '#7C3AED',
  accentVioletSoft: '#F5F3FF',
  accentAmber: '#D97706',
  accentAmberSoft: '#FFFBEB',
  accentRose: '#E11D48',
  accentRoseSoft: '#FFF1F2',
  accentGreen: '#16A34A',
  accentGreenSoft: '#F0FDF4',

  /* Utility */
  overlay: 'rgba(15, 23, 42, 0.55)',
  shadow: '#0F172A',
  skeleton: SLATE[200],
  skeletonHighlight: SLATE[100],
  transparent: 'transparent',
};

export const dark: typeof light = {
  /* Surfaces */
  background: '#0B0F14',
  backgroundElevated: '#161B22',
  surface: '#161B22',
  surfaceAlt: '#1D242E',
  surfaceSunken: '#0B0F14',
  surfaceInverse: SLATE[50],

  /* Lines */
  border: '#262E3A',
  borderStrong: '#39424F',
  divider: '#262E3A',

  /* Content */
  text: '#F1F5F9',
  textSecondary: '#AEB9C7',
  textMuted: '#8592A3',
  textDisabled: '#5A6675',
  textInverse: SLATE[900],

  /* Brand — lifted so it holds contrast against dark surfaces */
  primary: '#F2691D',
  primaryPressed: '#FF7F3C',
  primarySoft: '#2A1710',
  primaryBorder: '#4B2916',
  onPrimary: '#FFFFFF',

  /* Status */
  success: '#4ADE80',
  successSoft: '#0E2318',
  successBorder: '#1C4430',
  onSuccess: '#052E16',

  warning: '#FBBF24',
  warningSoft: '#261B07',
  warningBorder: '#4A360D',
  onWarning: '#271A02',

  danger: '#F87171',
  dangerSoft: '#2A1315',
  dangerBorder: '#4C2226',
  onDanger: '#3B0A0A',

  info: '#60A5FA',
  infoSoft: '#0E1B2E',
  infoBorder: '#1E3356',
  onInfo: '#061426',

  /* Accents */
  accentBlue: '#60A5FA',
  accentBlueSoft: '#0E1B2E',
  accentTeal: '#2DD4BF',
  accentTealSoft: '#082725',
  accentViolet: '#A78BFA',
  accentVioletSoft: '#1B1430',
  accentAmber: '#FBBF24',
  accentAmberSoft: '#261B07',
  accentRose: '#FB7185',
  accentRoseSoft: '#2A1119',
  accentGreen: '#4ADE80',
  accentGreenSoft: '#0E2318',

  /* Utility */
  overlay: 'rgba(0, 0, 0, 0.66)',
  shadow: '#000000',
  skeleton: '#1D242E',
  skeletonHighlight: '#262E3A',
  transparent: 'transparent',
};

export const COLORS = { light, dark };

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof light;
export type ColorToken = keyof ThemeColors;

export { BRAND, SLATE };
export default COLORS;
