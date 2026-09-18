import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';

export interface CheckboxProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  labelTx?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Labelled checkbox. The whole row is the touch target. */
export default function Checkbox({
  value,
  onChange,
  label,
  labelTx,
  disabled = false,
  style,
}: CheckboxProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => onChange(!value)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      hitSlop={6}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          columnGap: SPACING.sm,
          flexDirection: 'row',
          minHeight: 32,
        },
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: value ? colors.primary : colors.transparent,
          borderColor: value ? colors.primary : colors.borderStrong,
          borderRadius: RADIUS.xs,
          borderWidth: 1.5,
          height: 20,
          justifyContent: 'center',
          width: 20,
        }}
      >
        {value ? <Feather name="check" size={13} color={colors.onPrimary} /> : null}
      </View>

      {(!!label || !!labelTx) && (
        <Text variant="bodySm" color="textSecondary" tx={labelTx}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
