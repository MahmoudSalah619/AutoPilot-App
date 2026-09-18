import React from 'react';
import { I18nManager, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { Text } from '@/shared/components/ui';
import { formatDate } from '@/utils/format';
import type { CalendarEvent } from '@/features/calendar/hooks/useCalendarEvents';

/** One entry in the calendar's event list. */
export default function EventRow({
  event,
  onPress,
  showDate = true,
}: {
  event: CalendarEvent;
  onPress: () => void;
  showDate?: boolean;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  // Titles coming from the service catalogue are translation keys; user-typed
  // titles are not. Keys never contain a space, which is enough to tell apart.
  const title = event.title.includes(' ')
    ? event.title
    : t(event.title, { defaultValue: event.title });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          alignItems: 'center',
          columnGap: SPACING.md,
          flexDirection: 'row',
          opacity: event.isPast ? 0.6 : 1,
          paddingVertical: SPACING.md,
        },
        pressed && { opacity: 0.5 },
      ]}
    >
      <View
        style={{
          backgroundColor: colors[event.tone],
          borderRadius: RADIUS.pill,
          height: 36,
          width: 3,
        }}
      />

      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.surfaceAlt,
          borderRadius: RADIUS.md,
          height: 36,
          justifyContent: 'center',
          width: 36,
        }}
      >
        <Feather name={event.icon} size={16} color={colors[event.tone]} />
      </View>

      <View style={{ flex: 1, rowGap: 2 }}>
        <Text variant="h3" numberOfLines={1}>
          {title}
        </Text>

        <Text variant="caption" color="textMuted" numberOfLines={1}>
          {[
            showDate ? formatDate(event.date) : null,
            event.subtitle ?? (event.subtitleTx ? t(event.subtitleTx) : null),
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>

      <Feather
        name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'}
        size={18}
        color={colors.textMuted}
      />
    </Pressable>
  );
}
