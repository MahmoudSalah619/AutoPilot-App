import React from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { AppNotification, NotificationKind } from '@/@types/models';
import { Text } from '@/shared/components/ui';
import { formatRelative } from '@/utils/format';
import type { ColorToken } from '@/constants/Colors';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

const KIND_META: Record<
  NotificationKind,
  { icon: FeatherIconName; fg: ColorToken; bg: ColorToken }
> = {
  reminder: { icon: 'bell', fg: 'accentViolet', bg: 'accentVioletSoft' },
  documentExpiry: { icon: 'file-text', fg: 'warning', bg: 'warningSoft' },
  maintenanceDue: { icon: 'tool', fg: 'primary', bg: 'primarySoft' },
  fuelInsight: { icon: 'droplet', fg: 'accentTeal', bg: 'accentTealSoft' },
  system: { icon: 'info', fg: 'info', bg: 'infoSoft' },
};

/** One notification in the inbox. Unread rows carry a dot and stronger text. */
export default function NotificationRow({
  notification,
  onPress,
}: {
  notification: AppNotification;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const meta = KIND_META[notification.kind];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          alignItems: 'flex-start',
          columnGap: SPACING.md,
          flexDirection: 'row',
          paddingVertical: SPACING.md,
        },
        pressed && { opacity: 0.6 },
      ]}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors[meta.bg],
          borderRadius: RADIUS.md,
          height: 38,
          justifyContent: 'center',
          width: 38,
        }}
      >
        <Feather name={meta.icon} size={17} color={colors[meta.fg]} />
      </View>

      <View style={{ flex: 1, rowGap: SPACING.xxs }}>
        <Text variant="h3" color={notification.isRead ? 'textSecondary' : 'text'}>
          {notification.title}
        </Text>
        <Text variant="bodySm" color="textSecondary">
          {notification.body}
        </Text>
        <Text variant="caption" color="textMuted">
          {formatRelative(notification.createdAt)}
        </Text>
      </View>

      {!notification.isRead && (
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: RADIUS.pill,
            height: 8,
            marginTop: SPACING.sm,
            width: 8,
          }}
        />
      )}
    </Pressable>
  );
}
