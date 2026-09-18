import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, type StyleProp, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { RADIUS } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { ColorToken } from '@/constants/Colors';

export interface PulseHaloProps {
  children: React.ReactNode;
  /** Off by default, so the halo appears only when something needs attention. */
  active?: boolean;
  tone?: ColorToken;
  radius?: keyof typeof RADIUS;
  style?: StyleProp<ViewStyle>;
}

/**
 * A soft expanding ring behind its child.
 *
 * Used to draw the eye to one control when the app needs something — the stale
 * odometer being the case it exists for. It is gated on `active` rather than
 * always running, because motion that never stops stops meaning anything.
 */
export default function PulseHalo({
  children,
  active = false,
  tone = 'primary',
  radius = 'md',
  style,
}: PulseHaloProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  const [isReduceMotion, setIsReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setIsReduceMotion)
      .catch(() => setIsReduceMotion(false));
  }, []);

  const isAnimating = active && !isReduceMotion;

  useEffect(() => {
    if (!isAnimating) {
      cancelAnimation(progress);
      progress.value = 0;
      return;
    }

    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: 1900, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    return () => cancelAnimation(progress);
  }, [isAnimating, progress]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: (1 - progress.value) * 0.45,
    transform: [{ scale: 1 + progress.value * 0.28 }],
  }));

  return (
    <View style={style}>
      {active && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              backgroundColor: colors[tone],
              borderRadius: RADIUS[radius],
              bottom: 0,
              end: 0,
              position: 'absolute',
              start: 0,
              top: 0,
            },
            haloStyle,
          ]}
        />
      )}

      {children}
    </View>
  );
}
