import { useTheme } from '@/theme';
import type { ColorScheme } from '@/constants/Colors';

/** The color scheme currently in effect, honoring the user's stored override. */
export function useColorScheme(): ColorScheme {
  return useTheme().scheme;
}

export default useColorScheme;
