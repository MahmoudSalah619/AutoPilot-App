import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';
import type { ColorToken } from '@/constants/Colors';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

export interface StatTileProps {
  /** The number itself. Pre-formatted by the caller. */
  value: string;
  /** Short label under the value. */
  labelTx: string;
  /** Unit suffix rendered next to the value, e.g. `km` or `L`. */
  unit?: string;
  icon?: FeatherIconName;
  /** Tints the value and icon. Defaults to plain text color. */
  tone?: Extract<ColorToken, 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'>;
  /** `plain` for tiles already inside a card; `filled` to stand alone. */
  variant?: 'plain' | 'filled';
  style?: StyleProp<ViewStyle>;
}

const SOFT_BY_TONE = {
  primary: 'primarySoft',
  success: 'successSoft',
  warning: 'warningSoft',
  danger: 'dangerSoft',
  info: 'infoSoft',
  text: 'surfaceAlt',
} as const;

/** One number plus its label. The unit of every stats row in the app. */
export default function StatTile({
  value,
  labelTx,
  unit,
  icon,
  tone = 'text',
  variant = 'filled',
  style,
}: StatTileProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.lg,
          rowGap: SPACING.xs,
        },
        variant === 'filled' && {
          backgroundColor: colors[SOFT_BY_TONE[tone]],
          borderColor: colors.border,
          borderRadius: RADIUS.md,
          borderWidth: variant === 'filled' && tone === 'text' ? 1 : 0,
        },
        style,
      ]}
    >
      {!!icon && <Feather name={icon} size={16} color={colors[tone]} />}

      <View style={{ alignItems: 'baseline', columnGap: SPACING.xxs, flexDirection: 'row' }}>
        <Text variant="metric" color={tone}>
          {value}
        </Text>
        {!!unit && (
          <Text variant="labelSm" color="textMuted">
            {unit}
          </Text>
        )}
      </View>

      <Text variant="caption" color="textSecondary" tx={labelTx} numberOfLines={2} />
    </View>
  );
}
