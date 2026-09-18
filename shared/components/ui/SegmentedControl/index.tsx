import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';

export interface SegmentOption<T extends string> {
  value: T;
  labelTx: string;
  /** Optional count shown after the label, e.g. filter result totals. */
  count?: number;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Inline tab switcher for filtering a single list (All / Upcoming / Done).
 *
 * Preferred over navigating to a separate screen when the options are few and
 * the content shape is identical.
 */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surfaceAlt,
          borderRadius: RADIUS.md,
          flexDirection: 'row',
          padding: SPACING.xs,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            style={({ pressed }) => [
              {
                alignItems: 'center',
                borderRadius: RADIUS.sm,
                columnGap: SPACING.xs,
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                paddingVertical: SPACING.sm,
              },
              isSelected && { backgroundColor: colors.surface },
              pressed && !isSelected && { opacity: 0.6 },
            ]}
          >
            <Text
              variant="labelSm"
              color={isSelected ? 'text' : 'textMuted'}
              tx={option.labelTx}
              numberOfLines={1}
            />
            {option.count !== undefined && (
              <Text variant="labelSm" color={isSelected ? 'primary' : 'textDisabled'}>
                {String(option.count)}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
