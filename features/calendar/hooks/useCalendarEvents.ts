import { useMemo } from 'react';
import dayjs from 'dayjs';

import {
  useGetDocumentsQuery,
  useGetMaintenanceQuery,
  useGetRemindersQuery,
  useGetTripsQuery,
} from '@/apis/autopilotApi';
import type { ColorToken } from '@/constants/Colors';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

export type CalendarEventKind = 'service' | 'reminder' | 'document' | 'trip';

export interface CalendarEvent {
  id: string;
  kind: CalendarEventKind;
  title: string;
  /** `YYYY-MM-DD`, the key `react-native-calendars` marks on. */
  day: string;
  date: string;
  subtitleTx?: string;
  subtitle?: string;
  icon: FeatherIconName;
  tone: ColorToken;
  href: string;
  isPast: boolean;
}

/** Colour and icon per event kind — the calendar legend is built from this. */
export const EVENT_META: Record<
  CalendarEventKind,
  { tone: ColorToken; icon: FeatherIconName; labelTx: string }
> = {
  service: { tone: 'primary', icon: 'tool', labelTx: 'calendar.legend.service' },
  reminder: { tone: 'accentViolet', icon: 'bell', labelTx: 'calendar.legend.reminder' },
  document: { tone: 'accentBlue', icon: 'file-text', labelTx: 'calendar.legend.document' },
  trip: { tone: 'accentGreen', icon: 'map', labelTx: 'calendar.legend.trip' },
};

/**
 * Every dated thing in the app, unified into one timeline.
 *
 * The calendar is the one place a driver should be able to answer "what is
 * happening to my car this month?", so it pulls from all four sources rather
 * than showing only reminders.
 */
export function useCalendarEvents(vehicleId?: string) {
  const skip = !vehicleId;
  const filter = vehicleId ? { vehicleId } : undefined;

  const maintenanceQuery = useGetMaintenanceQuery(filter, { skip });
  const remindersQuery = useGetRemindersQuery(filter, { skip });
  const documentsQuery = useGetDocumentsQuery(filter, { skip });
  const tripsQuery = useGetTripsQuery(vehicleId, { skip });

  const events = useMemo<CalendarEvent[]>(() => {
    const today = dayjs().startOf('day');
    const toDay = (date: string) => dayjs(date).format('YYYY-MM-DD');

    const services = (maintenanceQuery.data ?? []).map<CalendarEvent>((record) => ({
      id: `service-${record.id}`,
      kind: 'service',
      title:
        record.serviceType === 'other' && record.customTitle
          ? record.customTitle
          : `serviceTypes.${record.serviceType}`,
      subtitleTx: `status.${record.status}`,
      day: toDay(record.date),
      date: record.date,
      icon: EVENT_META.service.icon,
      tone: EVENT_META.service.tone,
      href: '/(main)/(tabs)/Maintenance',
      isPast: dayjs(record.date).isBefore(today),
    }));

    const reminders = (remindersQuery.data ?? [])
      .filter((reminder) => reminder.dueDate)
      .map<CalendarEvent>((reminder) => ({
        id: `reminder-${reminder.id}`,
        kind: 'reminder',
        title: reminder.title,
        subtitleTx: `status.${reminder.status}`,
        day: toDay(reminder.dueDate as string),
        date: reminder.dueDate as string,
        icon: EVENT_META.reminder.icon,
        tone: EVENT_META.reminder.tone,
        href: '/(main)/services/service-reminders',
        isPast: dayjs(reminder.dueDate).isBefore(today),
      }));

    const documents = (documentsQuery.data ?? [])
      .filter((document) => document.expiryDate)
      .map<CalendarEvent>((document) => ({
        id: `document-${document.id}`,
        kind: 'document',
        title: document.title,
        subtitleTx: `status.${document.status}`,
        day: toDay(document.expiryDate as string),
        date: document.expiryDate as string,
        icon: EVENT_META.document.icon,
        tone: EVENT_META.document.tone,
        href: '/(main)/services/vehicle-documents',
        isPast: dayjs(document.expiryDate).isBefore(today),
      }));

    const trips = (tripsQuery.data ?? []).map<CalendarEvent>((trip) => ({
      id: `trip-${trip.id}`,
      kind: 'trip',
      title: trip.name,
      subtitle: `${trip.origin} → ${trip.destination}`,
      day: toDay(trip.departureDate),
      date: trip.departureDate,
      icon: EVENT_META.trip.icon,
      tone: EVENT_META.trip.tone,
      href: '/(main)/services/roadtrip-planner',
      isPast: dayjs(trip.departureDate).isBefore(today),
    }));

    return [...services, ...reminders, ...documents, ...trips].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [maintenanceQuery.data, remindersQuery.data, documentsQuery.data, tripsQuery.data]);

  const isLoading =
    maintenanceQuery.isLoading ||
    remindersQuery.isLoading ||
    documentsQuery.isLoading ||
    tripsQuery.isLoading;

  return {
    events,
    isLoading,
    isFetching: maintenanceQuery.isFetching || remindersQuery.isFetching,
    refetch: () => {
      maintenanceQuery.refetch();
      remindersQuery.refetch();
      documentsQuery.refetch();
      tripsQuery.refetch();
    },
  };
}

export default useCalendarEvents;
