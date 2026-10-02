import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useGetProfileQuery } from '@/apis/autopilotApi';
import { useTheme } from '@/theme';
import { HeaderBrandProvider, type HeaderBrand } from '@/shared/components/layout';
import { Avatar, Text } from '@/shared/components/ui';
import { NotificationBell } from '@/features/notifications';

const ACTION_SIZE = 40;

/** The signed-in user, as a shortcut to the profile tab. */
function ProfileShortcut() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data: profile } = useGetProfileQuery();

  const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';

  return (
    <Pressable
      onPress={() => router.navigate('/(main)/(tabs)/Profile')}
      accessibilityRole="button"
      accessibilityLabel={t('profile.title')}
      style={({ pressed }) => pressed && { opacity: 0.6 }}
    >
      <Avatar
        name={fullName}
        uri={profile?.avatarUrl}
        size={ACTION_SIZE}
        style={{ borderColor: colors.border, borderWidth: 1 }}
      />
    </Pressable>
  );
}

const MAIN_HEADER_BRAND: HeaderBrand = {
  barHeight: 68,
  center: (
    <Text variant="display" size={26}>
      Auto
      <Text variant="display" size={26} color="primary">
        Pilot
      </Text>
    </Text>
  ),
  actions: (
    <View style={{ alignItems: 'center', columnGap: SPACING.md, flexDirection: 'row' }}>
      <NotificationBell />
      <ProfileShortcut />
    </View>
  ),
};

/**
 * Gives every screen beneath it the signed-in header bar: the app name
 * centred, notifications and the profile shortcut on the trailing edge.
 */
export function MainHeaderProvider({ children }: { children: React.ReactNode }) {
  return <HeaderBrandProvider value={MAIN_HEADER_BRAND}>{children}</HeaderBrandProvider>;
}
