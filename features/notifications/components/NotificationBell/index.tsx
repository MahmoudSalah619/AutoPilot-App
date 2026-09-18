import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { RADIUS } from '@/constants/Layout';
import { useGetNotificationsQuery } from '@/apis/autopilotApi';
import { useTheme } from '@/theme';
import { IconButton, Text } from '@/shared/components/ui';

/**
 * Header bell with an unread count.
 *
 * The badge shows a capped count so a long-ignored inbox cannot blow out the
 * header layout.
 */
export default function NotificationBell() {
  const { colors } = useTheme();
  const { data: notifications = [] } = useGetNotificationsQuery();

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const displayCount = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <View>
      <IconButton
        icon="bell"
        variant="soft"
        color="text"
        onPress={() => router.push('/(main)/profile/notifications')}
        accessibilityLabel="notifications.title"
      />

      {unreadCount > 0 && (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.danger,
            borderColor: colors.background,
            borderRadius: RADIUS.pill,
            borderWidth: 2,
            end: -2,
            justifyContent: 'center',
            minWidth: 20,
            paddingHorizontal: 4,
            position: 'absolute',
            top: -4,
          }}
        >
          <Text variant="labelSm" size={10} rawColor={colors.onDanger}>
            {displayCount}
          </Text>
        </View>
      )}
    </View>
  );
}
