import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

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

/**
 * Bottom tab bar.
 *
 * Flat and evenly weighted — the previous version floated Home in a raised
 * circle, which cost vertical space, clipped on small screens, and implied a
 * hierarchy that does not exist between five peer destinations.
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
      {...tourTarget}
      style={{
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        flexDirection: 'row',
        height: TAB_BAR_HEIGHT + insets.bottom,
        paddingBottom: insets.bottom,
        paddingHorizontal: SPACING.sm,
        ...(Platform.OS === 'ios' ? elevation.md() : null),
      }}
    >
      {state.routes.map((route: (typeof state.routes)[number], index: number) => {
        const meta = TAB_META[route.name];
        if (!meta) return null;

        const isFocused = state.index === index;
        const { options } = descriptors[route.key];

        return (
          <Pressable
            key={route.key}
            onPress={() => handlePress(route, isFocused)}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={options.title ?? route.name}
            style={({ pressed }) => [
              {
                alignItems: 'center',
                flex: 1,
                justifyContent: 'center',
                paddingTop: SPACING.sm,
                rowGap: SPACING.xs,
              },
              pressed && { opacity: 0.6 },
            ]}
          >
            <View
              style={{
                alignItems: 'center',
                backgroundColor: isFocused ? colors.primarySoft : colors.transparent,
                borderRadius: RADIUS.pill,
                height: 30,
                justifyContent: 'center',
                width: 52,
              }}
            >
              <Feather
                name={meta.icon}
                size={20}
                color={isFocused ? colors.primary : colors.textMuted}
              />
            </View>

            <Text
              variant="labelSm"
              size={10}
              color={isFocused ? 'primary' : 'textMuted'}
              tx={meta.labelTx}
              numberOfLines={1}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
