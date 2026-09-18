import type { StyleProp, ViewStyle } from 'react-native';

/** Maps 1:1 to the status vocabulary used across maintenance, reminders and documents. */
export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  label?: string;
  tx?: string;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  /** Shows a leading dot in the tone's color. */
  withDot?: boolean;
  style?: StyleProp<ViewStyle>;
}
