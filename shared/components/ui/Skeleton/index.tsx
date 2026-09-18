import React, { useEffect } from 'react';
import { type DimensionValue, type StyleProp, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: keyof typeof RADIUS;
  style?: StyleProp<ViewStyle>;
}

/** A single shimmering placeholder block. */
export function Skeleton({ width = '100%', height = 16, radius = 'sm', style }: SkeletonProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    return () => cancelAnimation(progress);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.skeleton, colors.skeletonHighlight]
    ),
  }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ borderRadius: RADIUS[radius], height, width }, animatedStyle, style]}
    />
  );
}

/**
 * Card-shaped loading placeholder. Screens render `count` of these while their
 * query is in flight, so lists never flash an empty state before data lands.
 */
export function SkeletonCard({ count = 3 }: { count?: number }) {
  const { colors } = useTheme();

  return (
    <View style={{ rowGap: SPACING.md }}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: RADIUS.lg,
            borderWidth: 1,
            padding: SPACING.lg,
            rowGap: SPACING.md,
          }}
        >
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Skeleton width="45%" height={18} />
            <Skeleton width={68} height={22} radius="pill" />
          </View>
          <Skeleton width="72%" height={13} />
          <Skeleton width="55%" height={13} />
        </View>
      ))}
    </View>
  );
}

export default Skeleton;
