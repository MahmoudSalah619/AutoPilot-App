import { useTheme } from '@/theme';
import type { ColorToken } from '@/constants/Colors';

/**
 * Resolves a single color token against the active theme.
 *
 * Prefer `useTheme().colors` when a component needs more than one color.
 */
export function useThemeColor(token: ColorToken): string {
  const { colors } = useTheme();
  return colors[token];
}

export default useThemeColor;
