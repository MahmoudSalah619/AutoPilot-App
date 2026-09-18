import React from 'react';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { AppTabBar } from '@/features/navigation';

/**
 * Tab navigator. Order here is the on-screen order; Home sits in the middle
 * so the two most-used sections flank it.
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <AppTabBar {...props} />}
      backBehavior="history"
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="Maintenance" options={{ title: 'Maintenance' }} />
      <Tabs.Screen name="Calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="Home" options={{ title: 'Home' }} />
      <Tabs.Screen name="Services" options={{ title: 'Services' }} />
      <Tabs.Screen name="Profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
