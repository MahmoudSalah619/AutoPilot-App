import type { TextProps as RNTextProps } from 'react-native';
import type { ColorToken } from '@/constants/Colors';
import type { FontWeightToken, TypographyVariant } from '@/constants/Typography';

export interface TextProps extends RNTextProps {
  /**
   * Named role from the type scale. Prefer this over `size`/`weight` — it is
   * what keeps headings consistent between screens.
   */
  variant?: TypographyVariant;
  /** Semantic color token. */
  color?: ColorToken;
  /** Escape hatch for a literal color (badges tinted by data, etc.). */
  rawColor?: string;
  align?: 'auto' | 'left' | 'right' | 'center';
  /** Overrides the variant's font size. Use sparingly. */
  size?: number;
  /** Overrides the variant's font weight. Use sparingly. */
  weight?: FontWeightToken;
  /** Overrides the variant's line height. */
  lineHeight?: number;
  /**
   * Translation key. When set, the key is resolved through i18n and `children`
   * is ignored. Leave unset for values that are already user data.
   */
  tx?: string;
  /** Interpolation values for `tx`, e.g. `{{ count }}`. */
  txValues?: Record<string, unknown>;
  /** Dims the text to the disabled content color. */
  muted?: boolean;
}
