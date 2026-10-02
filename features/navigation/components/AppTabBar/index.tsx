import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { BottomTabBarProps } from 'expo-router/tabs';

import { RADIUS, SPACING } from '@/constants/Layout';
import { TAB_BAR_HEIGHT } from '@/constants/Metrics';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';
import { TOUR_TARGETS, useTourTarget } from '@/features/onboarding';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

const TAB_META: Record<string, { icon: FeatherIconName; labelTx: string }> = {
  Home: { icon: 'home', labelTx: 'tabs.home' },
  Maintenance: { icon: 'tool', labelTx: 'tabs.maintenance' },
  Calendar: { icon: 'calendar', labelTx: 'tabs.calendar' },
  Services: { icon: 'grid', labelTx: 'tabs.services' },
  Profile: { icon: 'user', labelTx: 'tabs.profile' },
};

const PILL_SPRING = { damping: 14, stiffness: 220, mass: 0.6 };

interface TabItemProps {
  icon: FeatherIconName;
  labelTx: string;
  isFocused: boolean;
  accessibilityLabel: string;
  onPress: () => void;
  onLongPress: () => void;
}

/** One destination. The filled pill springs in behind the icon on focus. */
function TabItem({
  icon,
  labelTx,
  isFocused,
  accessibilityLabel,
  onPress,
  onLongPress,
}: TabItemProps) {
  const { colors } = useTheme();
  const focus = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focus.value = withSpring(isFocused ? 1 : 0, PILL_SPRING);
  }, [isFocused, focus]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: focus.value,
    transform: [{ scale: 0.6 + 0.4 * focus.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
          rowGap: SPACING.xs,
        },
        pressed && { opacity: 0.6 },
      ]}
    >
      <View style={{ alignItems: 'center', height: 32, justifyContent: 'center', width: 52 }}>
        <Animated.View
          style={[
            {
              backgroundColor: colors.primary,
              borderRadius: RADIUS.pill,
              bottom: 0,
              left: 0,
              position: 'absolute',
              right: 0,
              top: 0,
            },
            pillStyle,
          ]}
        />

        <Feather name={icon} size={20} color={isFocused ? colors.onPrimary : colors.textMuted} />
      </View>

      <Text
        variant="labelSm"
        size={10}
        color={isFocused ? 'primary' : 'textMuted'}
        tx={labelTx}
        numberOfLines={1}
      />
    </Pressable>
  );
}

/**
 * Bottom tab bar.
 *
 * A rounded bar lifted off the screen edges, with the five destinations
 * evenly weighted — an earlier version floated Home in a raised circle, which
 * clipped on small screens and implied a hierarchy that does not exist between
 * peers. The bar stays in the layout flow rather than overlaying content, so
 * screens need no extra clearance for it.
 */
export default function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const tourTarget = useTourTarget(TOUR_TARGETS.tabs);

  const handlePress = (route: (typeof state.routes)[number], isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingBottom: Math.max(insets.bottom, SPACING.sm),
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.xs,
      }}
    >
      <View
        {...tourTarget}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: RADIUS.xxl,
          borderWidth: 1,
          flexDirection: 'row',
          height: TAB_BAR_HEIGHT,
          paddingHorizontal: SPACING.xs,
          ...elevation.md(),
        }}
      >
        {state.routes.map((route: (typeof state.routes)[number], index: number) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;

          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          return (
            <TabItem
              key={route.key}
              icon={meta.icon}
              labelTx={meta.labelTx}
              isFocused={isFocused}
              accessibilityLabel={options.title ?? route.name}
              onPress={() => handlePress(route, isFocused)}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            />
          );
        })}
      </View>
    </View>
  );
}
