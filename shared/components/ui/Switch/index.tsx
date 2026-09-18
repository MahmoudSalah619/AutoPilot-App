import React from 'react';
import { Platform, Switch as RNSwitch } from 'react-native';

import { useTheme } from '@/theme';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * Themed wrapper over the platform switch.
 *
 * Exists so the brand color is applied in exactly one place instead of every
 * settings row passing its own `trackColor`.
 */
export default function Switch({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
  testID,
}: SwitchProps) {
  const { colors, isDark } = useTheme();

  return (
    <RNSwitch
      testID={testID}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: isDark ? colors.borderStrong : colors.border, true: colors.primary }}
      thumbColor={Platform.OS === 'android' ? colors.surface : undefined}
      ios_backgroundColor={isDark ? colors.borderStrong : colors.border}
      style={{ opacity: disabled ? 0.5 : 1 }}
    />
  );
}
