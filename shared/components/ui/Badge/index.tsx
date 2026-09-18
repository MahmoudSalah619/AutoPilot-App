import React from 'react';
import { View } from 'react-native';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';
import type { BadgeProps, BadgeTone } from './types';
import styles from './styles';

/**
 * Compact status pill. Tone carries the meaning, so the same status always
 * looks the same wherever it appears.
 */
export default function Badge({
  label,
  tx,
  tone = 'neutral',
  size = 'md',
  withDot = false,
  style,
}: BadgeProps) {
  const { colors } = useTheme();

  const TONES: Record<BadgeTone, { bg: string; fg: string; border: string }> = {
    neutral: { bg: colors.surfaceAlt, fg: colors.textSecondary, border: colors.border },
    primary: { bg: colors.primarySoft, fg: colors.primary, border: colors.primaryBorder },
    success: { bg: colors.successSoft, fg: colors.success, border: colors.successBorder },
    warning: { bg: colors.warningSoft, fg: colors.warning, border: colors.warningBorder },
    danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerBorder },
    info: { bg: colors.infoSoft, fg: colors.info, border: colors.infoBorder },
  };

  const palette = TONES[tone];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderRadius: RADIUS.pill,
          paddingHorizontal: size === 'sm' ? SPACING.sm : SPACING.md,
          paddingVertical: size === 'sm' ? 2 : SPACING.xs,
          columnGap: SPACING.xs,
        },
        style,
      ]}
    >
      {withDot && <View style={[styles.dot, { backgroundColor: palette.fg }]} />}
      <Text variant="labelSm" tx={tx} rawColor={palette.fg} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
