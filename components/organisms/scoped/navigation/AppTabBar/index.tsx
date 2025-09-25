import { View, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Text, ThemedView } from '@/components/atoms';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '@/constants/Colors';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// Icon mapping for routes
const getIcon = (routeName: string, isFocused: boolean) => {
  const icons = {
    Home: 'home',
    Maintenance: 'build',
    Calendar: 'event',
    Services: 'checklist',
    Profile: 'person',
  } as const;
  const iconName = icons[routeName as keyof typeof icons] || 'home';
  const iconSize = routeName === 'Home' ? 28 : 24;

  let iconColor: string;
  if (routeName === 'Home') {
    // Home tab: white icon when focused (blue background), blue icon when not focused (white background)
    iconColor = isFocused ? COLORS.light.white : COLORS.light.primary;
  } else {
    // Other tabs: blue when focused, black when not focused
    iconColor = isFocused ? COLORS.light.primary : 'black';
  }

  return <MaterialIcons name={iconName} size={iconSize} color={iconColor} />;
};

// TabBar component
const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
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
    <ThemedView style={styles.tabbarContainer}>
      <View style={styles.tabbar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;

          const isFocused = state.index === index;
          const isHomeTab = route.name === 'Home';
          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => handlePress(route, isFocused)}
              style={[
                styles.tab,
                isHomeTab && styles.homeTab,
                isHomeTab && isFocused && styles.homeTabFocused,
              ]}
            >
              <View style={isHomeTab ? styles.homeIconContainer : undefined}>
                {getIcon(route.name, isFocused)}
              </View>
              {!isHomeTab && (
                <Text color={isFocused ? 'primary' : 'text'} size={10} numberOfLines={1}>
                  {label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  tabbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingBottom: 15,
    // paddingTop: 10,
    // backgroundColor: 'red',
    width: '100%',
    // paddingHorizontal: 16,
    // backgroundColor: "#fff",
  },
  tab: {
    paddingVertical: 8,
    // paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    // backgroundColor: "yellow",
    // minWidth: 60,
    // maxWidth: 100,
  },
  homeTab: {
    position: 'relative',
    top: -34,
    backgroundColor: COLORS.light.white,
    borderRadius: 32,
    width: 64,
    height: 64,
    elevation: 12,
    shadowColor: COLORS.light.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.light.primary,
  },
  homeTabFocused: {
    backgroundColor: COLORS.light.primary,
    borderColor: COLORS.light.white,
    transform: [{ scale: 1.05 }],
  },
  homeIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});

export default TabBar;
