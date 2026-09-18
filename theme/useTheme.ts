import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
import type { ThemeContextValue } from './types';

/**
 * The app's current theme. Must be called under `<ThemeProvider>`.
 *
 * @example
 * const { colors, spacing, isDark } = useTheme();
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a <ThemeProvider>.');
  }

  return context;
}
