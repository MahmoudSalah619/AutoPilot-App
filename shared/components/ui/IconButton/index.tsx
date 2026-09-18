import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { ColorToken } from '@/constants/Colors';

export type FeatherIconName = keyof typeof Feather.glyphMap;

export interface IconButtonProps {
  icon: FeatherIconName;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  /** `soft` gives the button a tinted circular background. */
  variant?: 'plain' | 'soft' | 'outline';
  color?: ColorToken;
  /** Background token for the `soft` variant. Defaults to the surface tint. */
  backgroundColor?: ColorToken;
  disabled?: boolean;
  /**
   * Required: icon-only controls have no visible label for screen readers.
   * Pass an already-resolved string, or use `accessibilityLabelTx` for a key.
   */
  accessibilityLabel?: string;
  /** Translation key for the accessibility label. */
  accessibilityLabelTx?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const DIMENSIONS = {
  sm: { box: 32, glyph: 16 },
  md: { box: 40, glyph: 20 },
  lg: { box: 48, glyph: 24 },
} as const;

/** Square tappable icon. Always meets the 32pt minimum touch target. */
export default function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'plain',
  color = 'text',
  backgroundColor = 'surfaceAlt',
  disabled = false,
  accessibilityLabel,
  accessibilityLabelTx,
  style,
  testID,
}: IconButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { box, glyph } = DIMENSIONS[size];

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabelTx ? t(accessibilityLabelTx) : accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          borderRadius: RADIUS.pill,
          height: box,
          justifyContent: 'center',
          width: box,
        },
        variant === 'soft' && { backgroundColor: colors[backgroundColor] },
        variant === 'outline' && { borderColor: colors.border, borderWidth: 1 },
        pressed && { opacity: 0.6 },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      <Feather name={icon} size={glyph} color={colors[color]} />
    </Pressable>
  );
}
