import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';

export interface CardProps {
  children: React.ReactNode;
  /** `elevated` floats on the background; `flat` sits inside another surface. */
  variant?: 'elevated' | 'flat' | 'outlined';
  padding?: keyof typeof SPACING;
  radius?: keyof typeof RADIUS;
  /** Makes the whole card tappable, with press feedback. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * The standard content container. Replaces per-screen hand-rolled card styles.
 */
export default function Card({
  children,
  variant = 'elevated',
  padding = 'lg',
  radius = 'lg',
  onPress,
  style,
  testID,
}: CardProps) {
  const { colors, elevation } = useTheme();

  const base: ViewStyle = {
    backgroundColor: variant === 'flat' ? colors.surfaceAlt : colors.surface,
    borderRadius: RADIUS[radius],
    padding: SPACING[padding],
    ...(variant === 'elevated' && elevation.sm()),
    ...(variant !== 'flat' && { borderWidth: 1, borderColor: colors.border }),
  };

  if (!onPress) {
    return (
      <View testID={testID} style={[base, style]}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [base, pressed && { opacity: 0.85 }, style]}
    >
      {children}
    </Pressable>
  );
}
