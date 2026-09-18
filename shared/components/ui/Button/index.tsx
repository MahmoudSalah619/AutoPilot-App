import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, View, type ViewStyle } from 'react-native';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';
import type { ButtonProps, ButtonSize, ButtonVariant } from './types';
import styles from './styles';

const SIZES: Record<ButtonSize, { height: number; paddingHorizontal: number; gap: number }> = {
  sm: { height: 36, paddingHorizontal: SPACING.md, gap: SPACING.xs },
  md: { height: 48, paddingHorizontal: SPACING.xl, gap: SPACING.sm },
  lg: { height: 56, paddingHorizontal: SPACING.xxl, gap: SPACING.sm },
};

const TEXT_VARIANT: Record<ButtonSize, 'labelSm' | 'label' | 'h3'> = {
  sm: 'labelSm',
  md: 'label',
  lg: 'h3',
};

/**
 * The app's only button.
 *
 * @example
 * <Button tx="common.save" onPress={save} loading={isSaving} fullWidth />
 * <Button variant="outline" tx="common.cancel" onPress={close} />
 */
export default function Button({
  title,
  tx,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  style,
  textStyle,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const { colors, elevation } = useTheme();
  const isInert = disabled || loading;

  const { container, contentColor } = useMemo(() => {
    const palette: Record<ButtonVariant, { container: ViewStyle; contentColor: string }> = {
      primary: {
        container: { backgroundColor: colors.primary, ...elevation.sm() },
        contentColor: colors.onPrimary,
      },
      secondary: {
        container: { backgroundColor: colors.primarySoft },
        contentColor: colors.primary,
      },
      outline: {
        container: {
          backgroundColor: colors.transparent,
          borderWidth: 1,
          borderColor: colors.borderStrong,
        },
        contentColor: colors.text,
      },
      ghost: {
        container: { backgroundColor: colors.transparent },
        contentColor: colors.primary,
      },
      danger: {
        container: { backgroundColor: colors.danger, ...elevation.sm() },
        contentColor: colors.onDanger,
      },
      dangerGhost: {
        container: { backgroundColor: colors.transparent },
        contentColor: colors.danger,
      },
    };

    return palette[variant];
  }, [variant, colors, elevation]);

  const metrics = SIZES[size];

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isInert}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInert, busy: loading }}
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [
        styles.base,
        container,
        {
          height: metrics.height,
          paddingHorizontal: iconOnly ? 0 : metrics.paddingHorizontal,
          columnGap: metrics.gap,
          borderRadius: iconOnly ? RADIUS.pill : RADIUS.md,
        },
        iconOnly && { width: metrics.height },
        fullWidth && styles.fullWidth,
        pressed && !isInert && styles.pressed,
        isInert && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} />
      ) : (
        <>
          {!!leftIcon && <View style={styles.icon}>{leftIcon}</View>}

          {!iconOnly && (!!title || !!tx) && (
            <Text
              variant={TEXT_VARIANT[size]}
              tx={tx}
              rawColor={contentColor}
              numberOfLines={1}
              style={textStyle}
            >
              {title}
            </Text>
          )}

          {!!rightIcon && <View style={styles.icon}>{rightIcon}</View>}
        </>
      )}
    </Pressable>
  );
}
