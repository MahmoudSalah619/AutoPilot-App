import { useMemo } from 'react';
import { useTheme } from './useTheme';
import type { Theme } from './types';

type NamedStyles = Record<string, object>;

/**
 * Builds a StyleSheet from the active theme, recomputed only when the theme
 * changes.
 *
 * Define the factory at module scope so it is a stable reference:
 *
 * @example
 * const makeStyles = ({ colors, spacing, radius }: Theme) =>
 *   StyleSheet.create({
 *     card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.md },
 *   });
 *
 * function MyCard() {
 *   const styles = useThemedStyles(makeStyles);
 *   return <View style={styles.card} />;
 * }
 */
export function useThemedStyles<T extends NamedStyles>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
