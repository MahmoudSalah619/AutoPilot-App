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
  /** Unit shown in the tile's top corner, e.g. `km` or `EGP`. */
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

/** Past this many characters the value drops a size so it stays on one line. */
const LONG_VALUE_LENGTH = 7;

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
      {/* The unit sits up here rather than beside the value: a third-width
          tile has no room for both once the figure reaches four digits. */}
      {(!!icon || !!unit) && (
        <View style={{ alignItems: 'center', flexDirection: 'row', minHeight: 16 }}>
          {!!icon && <Feather name={icon} size={16} color={colors[tone]} />}
          <View style={{ flex: 1 }} />
          {!!unit && (
            <Text variant="labelSm" color="textMuted">
              {unit}
            </Text>
          )}
        </View>
      )}

      <Text variant={value.length > LONG_VALUE_LENGTH ? 'metricSm' : 'metric'} color={tone}>
        {value}
      </Text>

      <Text variant="caption" color="textSecondary" tx={labelTx} numberOfLines={2} />
    </View>
  );
}
