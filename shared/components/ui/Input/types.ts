import type { ReactNode } from 'react';
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';

export interface InputProps extends Omit<TextInputProps, 'onChange' | 'onChangeText'> {
  /** Field label rendered above the control. */
  label?: string;
  /** Translation key for `label`. */
  labelTx?: string;
  /** Translation key for `placeholder`. */
  placeholderTx?: string;
  /** Validation message. Its presence switches the field to the error state. */
  error?: string;
  /** Helper text shown when there is no error. */
  hint?: string;
  hintTx?: string;
  onChangeText?: (value: string) => void;
  /** Leading adornment (icon, currency symbol and so on). */
  prefix?: ReactNode;
  /** Trailing adornment. Replaced by the reveal toggle when `secureTextEntry` is set. */
  suffix?: ReactNode;
  /** Renders a multi-line box. */
  multilineBox?: boolean;
  /** Marks the field required with an asterisk on the label. */
  required?: boolean;
  /** Debounces `onChangeText` by this many ms. Use for search fields. */
  debounceMs?: number;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}
