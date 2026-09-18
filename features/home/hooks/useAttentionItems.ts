import { useMemo } from 'react';

import { useGetDocumentsQuery, useGetRemindersQuery } from '@/apis/autopilotApi';
import type { BadgeTone } from '@/shared/components/ui';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';
import { daysUntil } from '@/utils/date';

export interface AttentionItem {
  id: string;
  kind: 'reminder' | 'document';
  title: string;
  /** Translation key describing why it needs attention. */
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

/**
 * Everything currently needing the driver's attention, in one ranked list.
 *
 * Merges overdue and due-soon reminders with expiring documents so the home
 * screen answers "what do I have to deal with?" in a single glance, rather
 * than making the user check three separate screens.
 */
export function useAttentionItems(vehicleId?: string) {
  const remindersQuery = useGetRemindersQuery(vehicleId ? { vehicleId } : undefined, {
    skip: !vehicleId,
  });
  const documentsQuery = useGetDocumentsQuery(vehicleId ? { vehicleId } : undefined, {
    skip: !vehicleId,
  });

  const items = useMemo<AttentionItem[]>(() => {
    const reminders = (remindersQuery.data ?? [])
      .filter((reminder) => reminder.status === 'overdue' || reminder.status === 'dueSoon')
      .map<AttentionItem>((reminder) => {
        const days = daysUntil(reminder.dueDate);
        const isOverdue = reminder.status === 'overdue';

        return {
          id: reminder.id,
          kind: 'reminder',
          title: reminder.title,
          detailTx: isOverdue ? 'due.overdueByDays' : 'due.inDays',
          detailValues: { count: Math.abs(Number.isFinite(days) ? days : 0) },
          dueDate: reminder.dueDate,
          urgency: Number.isFinite(days) ? days : 999,
          tone: isOverdue ? 'danger' : 'warning',
          statusTx: isOverdue ? 'status.overdue' : 'status.dueSoon',
          icon: 'bell',
          href: '/(main)/services/service-reminders',
        };
      });

    const documents = (documentsQuery.data ?? [])
      .filter((document) => document.status === 'expired' || document.status === 'expiringSoon')
      .map<AttentionItem>((document) => {
        const days = daysUntil(document.expiryDate);
        const isExpired = document.status === 'expired';

        return {
          id: document.id,
          kind: 'document',
          title: document.title,
          detailTx: isExpired ? 'due.overdueByDays' : 'due.inDays',
          detailValues: { count: Math.abs(Number.isFinite(days) ? days : 0) },
          dueDate: document.expiryDate,
          urgency: Number.isFinite(days) ? days : 999,
          tone: isExpired ? 'danger' : 'warning',
          statusTx: isExpired ? 'status.expired' : 'status.expiringSoon',
          icon: 'file-text',
          href: '/(main)/services/vehicle-documents',
        };
      });

    // Most overdue first, then soonest due.
    return [...reminders, ...documents].sort((a, b) => a.urgency - b.urgency);
  }, [remindersQuery.data, documentsQuery.data]);

  return {
    items,
    isLoading: remindersQuery.isLoading || documentsQuery.isLoading,
    refetch: () => {
      remindersQuery.refetch();
      documentsQuery.refetch();
    },
  };
}

export default useAttentionItems;
