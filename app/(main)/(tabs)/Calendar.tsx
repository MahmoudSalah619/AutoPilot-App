import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Calendar as RNCalendar, type DateData } from 'react-native-calendars';
import dayjs from 'dayjs';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { useCalendarTheme } from '@/shared/components/ui/DateField/useCalendarTheme';
import { Screen } from '@/shared/components/layout';
import {
  Card,
  Divider,
  EmptyState,
  SectionHeader,
  SkeletonCard,
  Text,
} from '@/shared/components/ui';
import { EventRow, EVENT_META, useCalendarEvents } from '@/features/calendar';
import { formatDate } from '@/utils/format';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const calendarTheme = useCalendarTheme();
  const { vehicle } = useActiveVehicle();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { events, isLoading, isFetching, refetch } = useCalendarEvents(vehicle?.id);

  /**
   * A day can hold several events, so each marked date carries up to three
   * dots — one per kind — instead of collapsing everything into one color.
   */
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    events.forEach((event) => {
      const existing = marks[event.day] ?? { dots: [] };
      const dotColor = colors[event.tone];

      if (!existing.dots.some((dot: { key: string }) => dot.key === event.kind)) {
        existing.dots.push({ key: event.kind, color: dotColor });
      }

      marks[event.day] = existing;
    });

    if (selectedDay) {
      marks[selectedDay] = {
        ...(marks[selectedDay] ?? { dots: [] }),
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return marks;
  }, [events, selectedDay, colors]);

  const visibleEvents = useMemo(() => {
    if (selectedDay) {
      return events.filter((event) => event.day === selectedDay);
    }

    // Default view: what is still ahead.
    const today = dayjs().startOf('day');
    return events.filter((event) => !dayjs(event.date).isBefore(today)).slice(0, 12);
  }, [events, selectedDay]);

  return (
    <Screen
      scroll
      hasTabBar
      gap="lg"
      refreshing={isFetching}
      onRefresh={refetch}
      header={{
        titleTx: 'calendar.title',
        subtitleTx: 'calendar.subtitle',
        variant: 'large',
        showBack: false,
      }}
    >
      <Card padding="sm">
        <RNCalendar
          markingType="multi-dot"
          markedDates={markedDates}
          onDayPress={(day: DateData) =>
            setSelectedDay((current) => (current === day.dateString ? null : day.dateString))
          }
          enableSwipeMonths
          theme={calendarTheme}
        />

        <Divider spacing="sm" />

        <View
          style={{
            columnGap: SPACING.lg,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            paddingBottom: SPACING.sm,
            rowGap: SPACING.sm,
          }}
        >
          {(Object.keys(EVENT_META) as (keyof typeof EVENT_META)[]).map((kind) => (
            <View
              key={kind}
              style={{ alignItems: 'center', columnGap: SPACING.xs, flexDirection: 'row' }}
            >
              <View
                style={{
                  backgroundColor: colors[EVENT_META[kind].tone],
                  borderRadius: RADIUS.pill,
                  height: 8,
                  width: 8,
                }}
              />
              <Text variant="caption" color="textSecondary" tx={EVENT_META[kind].labelTx} />
            </View>
          ))}
        </View>
      </Card>

      <View style={{ rowGap: SPACING.md }}>
        <SectionHeader
          titleTx={selectedDay ? 'calendar.eventsOnDay' : 'calendar.upcomingEvents'}
          right={
            selectedDay ? (
              <Text variant="labelSm" color="primary">
                {formatDate(selectedDay)}
              </Text>
            ) : undefined
          }
        />

        {isLoading ? (
          <SkeletonCard count={3} />
        ) : visibleEvents.length === 0 ? (
          <Card variant="outlined">
            <EmptyState
              layout="inline"
              icon="calendar"
              titleTx={selectedDay ? 'calendar.noEventsTitle' : 'calendar.emptyTitle'}
              bodyTx={selectedDay ? 'calendar.noEventsBody' : 'calendar.emptyBody'}
            />
          </Card>
        ) : (
          <Card padding="md">
            {visibleEvents.map((event, index) => (
              <View key={event.id}>
                {index > 0 && <Divider inset={55} />}
                <EventRow
                  event={event}
                  showDate={!selectedDay}
                  onPress={() => router.push(event.href as never)}
                />
              </View>
            ))}
          </Card>
        )}
      </View>
    </Screen>
  );
}
