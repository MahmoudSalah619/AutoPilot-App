import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { SPACING } from '@/constants/Layout';
import Chip from '@/shared/components/ui/Chip';
import Text from '@/shared/components/ui/Text';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

export interface Option<T extends string> {
  value: T;
  labelTx?: string;
  label?: string;
  icon?: FeatherIconName;
}

export interface OptionGroupProps<T extends string> {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  labelTx?: string;
  hintTx?: string;
  error?: string;
  required?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Wrapped chip selector for a small, fixed option set.
 *
 * Preferred over a dropdown when every option fits on screen — the user sees
 * the whole choice at once instead of tapping to discover it.
 */
export default function OptionGroup<T extends string>({
  options,
  value,
  onChange,
  labelTx,
  hintTx,
  error,
  required = false,
  style,
}: OptionGroupProps<T>) {
  return (
    <View style={[{ rowGap: SPACING.sm, width: '100%' }, style]}>
      {!!labelTx && (
        <View style={{ flexDirection: 'row' }}>
          <Text variant="label" color="textSecondary" tx={labelTx} />
          {required ? (
            <Text variant="label" color="danger">
              {' *'}
            </Text>
          ) : null}
        </View>
      )}

      <View
        style={{
          columnGap: SPACING.sm,
          flexDirection: 'row',
          flexWrap: 'wrap',
          rowGap: SPACING.sm,
        }}
      >
        {options.map((option) => (
          <Chip
            key={option.value}
            tx={option.labelTx}
            label={option.label}
            icon={option.icon}
            selected={option.value === value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>

      {(!!error || !!hintTx) && (
        <Text
          variant="caption"
          color={error ? 'danger' : 'textMuted'}
          tx={error ? undefined : hintTx}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
