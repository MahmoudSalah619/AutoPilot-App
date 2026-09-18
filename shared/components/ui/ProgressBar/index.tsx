import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';
import type { ColorToken } from '@/constants/Colors';

export interface ProgressBarProps {
  /** Completion from 0 to 1. Values outside the range are clamped. */
  value: number;
  tone?: Extract<ColorToken, 'primary' | 'success' | 'warning' | 'danger' | 'info'>;
  height?: number;
  /** Caption shown above the track, on the leading edge. */
  labelTx?: string;
  /** Literal leading caption, for names that come from user data. */
  label?: string;
  /** Caption shown above the track, on the trailing edge (usually a value). */
  valueLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Horizontal progress track. Used for service intervals (km since last
 * service) and document expiry countdowns.
 */
export default function ProgressBar({
  value,
  tone = 'primary',
  height = 8,
  labelTx,
  label,
  valueLabel,
  style,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

  return (
    <View style={[{ rowGap: SPACING.xs, width: '100%' }, style]}>
      {(!!labelTx || !!label || !!valueLabel) && (
        <View
          style={{
            alignItems: 'center',
            columnGap: SPACING.sm,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {(!!labelTx || !!label) && (
            <Text
              variant="caption"
              color="textSecondary"
              tx={labelTx}
              numberOfLines={1}
              style={{ flexShrink: 1 }}
            >
              {label}
            </Text>
          )}
          {!!valueLabel && (
            <Text variant="labelSm" color={tone}>
              {valueLabel}
            </Text>
          )}
        </View>
      )}

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
        style={{
          backgroundColor: colors.surfaceAlt,
          borderRadius: RADIUS.pill,
          height,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <View
          style={{
            backgroundColor: colors[tone],
            borderRadius: RADIUS.pill,
            height: '100%',
            width: `${clamped * 100}%`,
          }}
        />
      </View>
    </View>
  );
}
