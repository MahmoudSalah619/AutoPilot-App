import React, { useCallback, useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { DURATION, HIT_SLOP, RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';
import type { ColorToken } from '@/constants/Colors';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

export interface CollapsibleProps {
  /** Row label. Phrase it as the thing being revealed, e.g. "Add details". */
  titleTx: string;
  /** Optional hint under the title, for what is inside. */
  subtitleTx?: string;
  icon?: FeatherIconName;
  /** Tints the icon and chevron. */
  tone?: ColorToken;
  /** Starts open. Use when the content already holds values. */
  defaultOpen?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Disclosure row.
 *
 * Keeps optional form fields out of the default path without hiding them: the
 * common case stays short, and the long tail is one tap away.
 */
export default function Collapsible({
  titleTx,
  subtitleTx,
  icon,
  tone = 'textSecondary',
  defaultOpen = false,
  children,
  style,
  testID,
}: CollapsibleProps) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const chevron = useSharedValue(defaultOpen ? 1 : 0);

  const toggle = useCallback(() => {
    setIsOpen((open) => {
      chevron.value = withTiming(open ? 0 : 1, { duration: DURATION.fast });
      return !open;
    });
  }, [chevron]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevron.value * 180}deg` }],
  }));

  return (
    <Animated.View layout={LinearTransition.duration(DURATION.base)} style={style}>
      <Pressable
        testID={testID}
        onPress={toggle}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: pressed ? colors.surfaceAlt : colors.transparent,
          borderColor: colors.border,
          borderRadius: RADIUS.md,
          borderWidth: 1,
          columnGap: SPACING.md,
          flexDirection: 'row',
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.md,
        })}
      >
        {!!icon && <Feather name={icon} size={16} color={colors[tone]} />}

        <View style={{ flex: 1, rowGap: SPACING.xxs }}>
          <Text variant="label" tx={titleTx} />
          {!!subtitleTx && <Text variant="caption" color="textMuted" tx={subtitleTx} />}
        </View>

        <Animated.View style={chevronStyle}>
          <Feather name="chevron-down" size={18} color={colors[tone]} />
        </Animated.View>
      </Pressable>

      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(DURATION.base)}
          exiting={FadeOut.duration(DURATION.fast)}
          style={{ paddingTop: SPACING.lg, rowGap: SPACING.lg }}
        >
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
}
