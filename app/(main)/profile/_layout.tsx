import { Stack } from 'expo-router';
import React from 'react';
import { COLORS } from '@/constants/Colors';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.light.background,
        },
        headerTintColor: COLORS.light.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="personal-information" 
        options={{ 
          title: 'Personal Information',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="vehicle-information" 
        options={{ 
          title: 'Vehicle Information',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          title: 'Notifications',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="privacy-security" 
        options={{ 
          title: 'Privacy & Security',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="help-support" 
        options={{ 
          title: 'Help & Support',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="about-autopilot" 
        options={{ 
          title: 'About AutoPilot',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}