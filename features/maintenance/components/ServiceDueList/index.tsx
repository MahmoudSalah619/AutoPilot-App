import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { MaintenanceStatus } from '@/@types/models';
import { Badge, Card, Divider, Text, type BadgeTone } from '@/shared/components/ui';
import { describeServiceDue, type ServiceDue } from '@/utils/domain';
import { formatDate, formatDistance } from '@/utils/format';

const STATUS_TONE: Record<ServiceDue['status'], BadgeTone> = {
  upcoming: 'neutral',
  dueSoon: 'warning',
  overdue: 'danger',
};

const STATUS_TEXT: Record<ServiceDue['status'], 'textMuted' | 'warning' | 'danger'> = {
  upcoming: 'textMuted',
  dueSoon: 'warning',
  overdue: 'danger',
};

export interface ServiceDueListProps {
  dues: ServiceDue[];
}

/**
 * When each logged service comes round again.
 *
 * Answers "what is next?" from the intervals already on the service history,
 * so the driver sees the next oil change counting down without having to set
 * up a reminder for it.
 */
export default function ServiceDueList({ dues }: ServiceDueListProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (dues.length === 0) return null;

  return (
    <View style={{ rowGap: SPACING.sm }}>
      <View style={{ rowGap: 2 }}>
        <Text variant="h2" tx="maintenance.comingUpTitle" />
        <Text variant="caption" color="textMuted" tx="maintenance.comingUpSubtitle" />
      </View>

      <Card padding="md">
        {dues.map((due, index) => {
          const { record } = due;
          const detail = describeServiceDue(due);
          const status: MaintenanceStatus = due.status;

          const title =
            record.serviceType === 'other' && record.customTitle
              ? record.customTitle
              : t(`serviceTypes.${record.serviceType}`);

          const target =
            due.basis === 'distance' && due.dueOdometer != null
              ? t('maintenance.dueAt', { odometer: formatDistance(due.dueOdometer) })
              : due.dueDate
                ? t('maintenance.dueOn', { date: formatDate(due.dueDate) })
                : undefined;

          return (
            <View key={record.id}>
              {index > 0 && <Divider inset={50} />}

              <View
                style={{
                  alignItems: 'center',
                  columnGap: SPACING.md,
                  flexDirection: 'row',
                  paddingVertical: SPACING.md,
                }}
              >
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: colors.primarySoft,
                    borderRadius: RADIUS.md,
                    height: 38,
                    justifyContent: 'center',
                    width: 38,
                  }}
                >
                  <Feather name="tool" size={17} color={colors.primary} />
                </View>

                <View style={{ flex: 1, rowGap: 2 }}>
                  <Text variant="h3" numberOfLines={1}>
                    {title}
                  </Text>
                  <Text variant="caption" color={STATUS_TEXT[due.status]}>
                    {[t(detail.key, detail.values ?? {}) as string, target]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>

                <Badge tone={STATUS_TONE[due.status]} tx={`status.${status}`} size="sm" />
              </View>
            </View>
          );
        })}
      </Card>
    </View>
  );
}
