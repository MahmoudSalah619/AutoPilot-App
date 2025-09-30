import { Tabs } from 'expo-router';
import React from 'react';
import { AppTabBar } from '@/features/navigation';
import '@/shared/components/layout/bottomsheets';
/**
 * _layout component sets up the tab navigation layout.
 * It uses the Tabs component from expo-router to define the tab navigation structure.
 */
export default function _layout() {
  return (
    <Tabs
              tabBar={(props) => <AppTabBar {...props} />} // Use the custom TabBar component
      backBehavior="history"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="Maintenance"
        options={{
          title: 'Maintenance',
        }}
      />
      <Tabs.Screen
        name="Calendar"
        options={{
          title: 'Calendar',
        }}
      />
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="Services"
        options={{
          title: 'Services',
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
