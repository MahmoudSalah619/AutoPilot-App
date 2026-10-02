import { useMemo } from 'react';

import {
  useGetDocumentsQuery,
  useGetMaintenanceQuery,
  useGetRemindersQuery,
} from '@/apis/autopilotApi';
import type { BadgeTone } from '@/shared/components/ui';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';
import { daysUntil, describeDueDate } from '@/utils/date';
import { describeServiceDue, projectServiceDues, serviceDueUrgency } from '@/utils/domain';

export interface AttentionItem {
  id: string;
  kind: 'reminder' | 'document' | 'maintenance';
  title: string;
  /** Translation key for the title, for items named by the app rather than the user. */
  titleTx?: string;
  /** Translation key describing how far off it is. */
  detailTx: string;
  detailValues?: Record<string, number>;
  dueDate?: string;
  /** Lower sorts first. */
  urgency: number;
  tone: BadgeTone;
  statusTx: string;
  icon: FeatherIconName;
  href: string;
}

/** Where an item sits: needing action now, or merely next in line. */
type Standing = 'overdue' | 'dueSoon' | 'upcoming';

const STANDING_TONE: Record<Standing, BadgeTone> = {
  overdue: 'danger',
  dueSoon: 'warning',
  upcoming: 'neutral',
};

/**
 * Everything on the driver's horizon, split by whether it needs action.
 *
 * `items` merges overdue and due-soon reminders, expiring documents and
 * services whose interval is nearly up, so the home screen answers "what do I
 * have to deal with?" in a single glance rather than making the user check
 * three separate screens. `upcoming` is the same list one step earlier —
 * what comes next, before any of it is a problem.
 */
export function useAttentionItems(vehicleId?: string, currentOdometer = 0) {
  const remindersQuery = useGetRemindersQuery(vehicleId ? { vehicleId } : undefined, {
    skip: !vehicleId,
  });
  const documentsQuery = useGetDocumentsQuery(vehicleId ? { vehicleId } : undefined, {
    skip: !vehicleId,
  });
  const maintenanceQuery = useGetMaintenanceQuery(vehicleId ? { vehicleId } : undefined, {
    skip: !vehicleId,
  });

  const { items, upcoming } = useMemo(() => {
    const all: (AttentionItem & { standing: Standing })[] = [];

    (remindersQuery.data ?? []).forEach((reminder) => {
      if (reminder.status === 'completed' || !reminder.dueDate) return;

      const standing: Standing = reminder.status === 'active' ? 'upcoming' : reminder.status;
      const days = daysUntil(reminder.dueDate);
      const detail = describeDueDate(reminder.dueDate);

      all.push({
        id: reminder.id,
        kind: 'reminder',
        title: reminder.title,
        detailTx: detail.key,
        detailValues: detail.values,
        dueDate: reminder.dueDate,
        urgency: Number.isFinite(days) ? days : 999,
        tone: STANDING_TONE[standing],
        statusTx: standing === 'upcoming' ? 'status.active' : `status.${standing}`,
        icon: 'bell',
        href: '/(main)/services/service-reminders',
        standing,
      });
    });

    (documentsQuery.data ?? []).forEach((document) => {
      if (document.status === 'noExpiry' || !document.expiryDate) return;

      const standing: Standing =
        document.status === 'expired'
          ? 'overdue'
          : document.status === 'expiringSoon'
            ? 'dueSoon'
            : 'upcoming';
      const days = daysUntil(document.expiryDate);
      const detail = describeDueDate(document.expiryDate);

      all.push({
        id: document.id,
        kind: 'document',
        title: document.title,
        detailTx: detail.key,
        detailValues: detail.values,
        dueDate: document.expiryDate,
        urgency: Number.isFinite(days) ? days : 999,
        tone: STANDING_TONE[standing],
        statusTx: `status.${document.status}`,
        icon: 'file-text',
        href: '/(main)/services/vehicle-documents',
        standing,
      });
    });

    projectServiceDues(maintenanceQuery.data ?? [], currentOdometer).forEach((due) => {
      const detail = describeServiceDue(due);
      const { record } = due;

      all.push({
        id: record.id,
        kind: 'maintenance',
        title: record.customTitle ?? '',
        titleTx:
          record.serviceType === 'other' && record.customTitle
            ? undefined
            : `serviceTypes.${record.serviceType}`,
        detailTx: detail.key,
        detailValues: detail.values,
        dueDate: due.dueDate,
        urgency: serviceDueUrgency(due),
        tone: STANDING_TONE[due.status],
        statusTx: `status.${due.status}`,
        icon: 'tool',
        href: '/(main)/(tabs)/Maintenance',
        standing: due.status,
      });
    });

    // Most overdue first, then soonest due.
    const ranked = all.sort((a, b) => a.urgency - b.urgency);

    return {
      items: ranked.filter((item) => item.standing !== 'upcoming') as AttentionItem[],
      upcoming: ranked.filter((item) => item.standing === 'upcoming') as AttentionItem[],
    };
  }, [remindersQuery.data, documentsQuery.data, maintenanceQuery.data, currentOdometer]);

  return {
    items,
    upcoming,
    isLoading: remindersQuery.isLoading || documentsQuery.isLoading || maintenanceQuery.isLoading,
    refetch: () => {
      remindersQuery.refetch();
      documentsQuery.refetch();
      maintenanceQuery.refetch();
    },
  };
}

export default useAttentionItems;
