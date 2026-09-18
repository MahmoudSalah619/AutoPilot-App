import type { ReactNode } from 'react';
import type { GestureResponderEvent, StyleProp, TextStyle, ViewStyle } from 'react-native';

export type ButtonVariant =
  /** Solid brand fill. The single primary action on a screen. */
  | 'primary'
  /** Tinted brand background, no border. Secondary actions. */
  | 'secondary'
  /** Transparent with a border. Equal-weight alternatives. */
  | 'outline'
  /** No background or border. Tertiary / inline actions. */
  | 'ghost'
  /** Solid destructive fill. */
  | 'danger'
  /** Transparent destructive. */
  | 'dangerGhost';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Literal label. Prefer `tx` for anything user-visible and static. */
  title?: string;
  /** Translation key for the label. */
  tx?: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** Stretches to fill the parent's cross axis. */
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Renders a square button containing only `leftIcon`. */
  iconOnly?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  testID?: string;
}
