import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';

export interface DividerProps {
  /** Vertical space added above and below. */
  spacing?: keyof typeof SPACING;
  /** Centered label, e.g. "or". */
  labelTx?: string;
  /** Pulls the line in from the leading edge to align under a row's text. */
  inset?: number;
  style?: StyleProp<ViewStyle>;
}

/** Hairline rule, optionally with a centered label. */
export default function Divider({ spacing = 'none', labelTx, inset = 0, style }: DividerProps) {
  const { colors } = useTheme();
  const line = { backgroundColor: colors.divider, flex: 1, height: 1 };

  if (labelTx) {
    return (
      <View
        style={[
          {
            alignItems: 'center',
            columnGap: SPACING.md,
            flexDirection: 'row',
            marginVertical: SPACING[spacing],
          },
          style,
        ]}
      >
        <View style={line} />
        <Text variant="caption" color="textMuted" tx={labelTx} />
        <View style={line} />
      </View>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: colors.divider,
          height: 1,
          marginVertical: SPACING[spacing],
          marginStart: inset,
        },
        style,
      ]}
    />
  );
}
