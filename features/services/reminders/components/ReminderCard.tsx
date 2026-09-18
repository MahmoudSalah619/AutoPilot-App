import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { ReminderStatus, ServiceReminder } from '@/@types/models';
import {
  Badge,
  Button,
  Card,
  IconButton,
  ProgressBar,
  Text,
  type BadgeTone,
} from '@/shared/components/ui';
import { reminderProgress } from '@/utils/domain';
import { describeDueDate, formatDate, formatDistance } from '@/utils/format';

const STATUS_TONE: Record<ReminderStatus, BadgeTone> = {
  active: 'neutral',
  dueSoon: 'warning',
  overdue: 'danger',
  completed: 'success',
};

const PROGRESS_TONE: Record<ReminderStatus, 'primary' | 'warning' | 'danger' | 'success'> = {
  active: 'primary',
  dueSoon: 'warning',
  overdue: 'danger',
  completed: 'success',
};

export interface ReminderCardProps {
  reminder: ServiceReminder;
  /** Current odometer, needed to render distance-trigger progress. */
  currentOdometer: number;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
}

/**
 * One service reminder.
 *
 * Shows whichever trigger is relevant — a date, a distance, or both — with a
 * progress track so "how close am I?" is readable at a glance.
 */
export default function ReminderCard({
  reminder,
  currentOdometer,
  onEdit,
  onDelete,
  onComplete,
}: ReminderCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const due = describeDueDate(reminder.dueDate);
  const progress = reminderProgress(reminder, currentOdometer);
  const remainingKm =
    reminder.dueOdometer != null ? reminder.dueOdometer - currentOdometer : undefined;

  return (
    <Card padding="lg" style={{ rowGap: SPACING.md }}>
      <View style={{ alignItems: 'flex-start', columnGap: SPACING.sm, flexDirection: 'row' }}>
        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="h3" numberOfLines={2}>
            {reminder.title}
          </Text>
          <Text variant="caption" color="textMuted">
            {t(`serviceTypes.${reminder.serviceType}`)}
          </Text>
        </View>

        <Badge tone={STATUS_TONE[reminder.status]} tx={`status.${reminder.status}`} size="sm" />
      </View>

      <ProgressBar
        value={progress}
        tone={PROGRESS_TONE[reminder.status]}
        labelTx={reminder.dueDate ? undefined : 'reminders.dueOdometer'}
        valueLabel={
          reminder.trigger === 'distance' && remainingKm != null
            ? formatDistance(Math.max(0, remainingKm))
            : (t(due.key, due.values ?? {}) as string)
        }
      />

      <View
        style={{
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          flexDirection: 'row',
          paddingTop: SPACING.md,
        }}
      >
        {!!reminder.dueDate && reminder.trigger !== 'distance' && (
          <View style={{ flex: 1, rowGap: 2 }}>
            <Text variant="caption" color="textMuted" tx="reminders.dueDate" />
            <Text variant="labelSm">{formatDate(reminder.dueDate)}</Text>
          </View>
        )}

        {reminder.dueOdometer != null && reminder.trigger !== 'date' && (
          <View style={{ flex: 1, rowGap: 2 }}>
            <Text variant="caption" color="textMuted" tx="reminders.dueOdometer" />
            <Text variant="labelSm">{formatDistance(reminder.dueOdometer)}</Text>
          </View>
        )}
      </View>

      <View style={{ alignItems: 'center', columnGap: SPACING.xs, flexDirection: 'row' }}>
        <Button
          variant="secondary"
          size="sm"
          tx="reminders.markDone"
          onPress={onComplete}
          style={{ flex: 1 }}
        />
        <IconButton
          icon="edit-2"
          size="sm"
          color="textSecondary"
          onPress={onEdit}
          accessibilityLabel={t('common.edit')}
        />
        <IconButton
          icon="trash-2"
          size="sm"
          color="danger"
          onPress={onDelete}
          accessibilityLabel={t('common.delete')}
        />
      </View>
    </Card>
  );
}
