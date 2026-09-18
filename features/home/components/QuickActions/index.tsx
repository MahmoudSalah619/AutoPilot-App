import React from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';
import type { ColorToken } from '@/constants/Colors';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

export interface QuickAction {
  key: string;
  icon: FeatherIconName;
  labelTx: string;
  tone: Extract<ColorToken, 'primary' | 'accentBlue' | 'accentTeal' | 'accentViolet'>;
  onPress: () => void;
}

const SOFT_BY_TONE = {
  primary: 'primarySoft',
  accentBlue: 'accentBlueSoft',
  accentTeal: 'accentTealSoft',
  accentViolet: 'accentVioletSoft',
} as const;

/** Four-up row of the actions a driver takes most often. */
export default function QuickActions({ actions }: { actions: QuickAction[] }) {
  const { colors } = useTheme();

  return (
    <View style={{ columnGap: SPACING.sm, flexDirection: 'row' }}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          onPress={action.onPress}
          accessibilityRole="button"
          style={({ pressed }) => [
            {
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: RADIUS.lg,
              borderWidth: 1,
              flex: 1,
              paddingHorizontal: SPACING.xs,
              paddingVertical: SPACING.lg,
              rowGap: SPACING.sm,
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors[SOFT_BY_TONE[action.tone]],
              borderRadius: RADIUS.pill,
              height: 40,
              justifyContent: 'center',
              width: 40,
            }}
          >
            <Feather name={action.icon} size={18} color={colors[action.tone]} />
          </View>

          <Text variant="labelSm" size={11} align="center" tx={action.labelTx} numberOfLines={2} />
        </Pressable>
      ))}
    </View>
  );
}
