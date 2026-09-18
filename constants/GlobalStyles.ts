import { StyleSheet } from 'react-native';
import { SPACING } from './Layout';

/**
 * Layout-only helpers. Intentionally contains no colors or font families —
 * those belong to the theme and the `Text` component respectively.
 */
const GLOBAL_STYLES = StyleSheet.create({
  fill: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowCenter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: {
    flexWrap: 'wrap',
  },
  gapXs: { gap: SPACING.xs },
  gapSm: { gap: SPACING.sm },
  gapMd: { gap: SPACING.md },
  gapLg: { gap: SPACING.lg },
  gapXl: { gap: SPACING.xl },
});

export default GLOBAL_STYLES;
