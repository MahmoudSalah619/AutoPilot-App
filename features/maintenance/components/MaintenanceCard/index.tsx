import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { MaintenanceRecord, MaintenanceStatus } from '@/@types/models';
import { Badge, Card, Text, type BadgeTone } from '@/shared/components/ui';
import { formatCurrency, formatDate, formatDistance } from '@/utils/format';

const STATUS_TONE: Record<MaintenanceStatus, BadgeTone> = {
  completed: 'success',
  upcoming: 'neutral',
  dueSoon: 'warning',
  overdue: 'danger',
};

export interface MaintenanceCardProps {
  record: MaintenanceRecord;
  onPress?: () => void;
}

/**
 * One service record.
 *
 * Shows the odometer and cost inline because those are what a driver actually
 * scans a service history for — "when did I last do this, and at what
 * mileage?".
 */
export default function MaintenanceCard({ record, onPress }: MaintenanceCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const title =
    record.serviceType === 'other' && record.customTitle
      ? record.customTitle
      : t(`serviceTypes.${record.serviceType}`);

  return (
    <Card onPress={onPress} padding="lg" style={{ rowGap: SPACING.md }}>
      <View style={{ alignItems: 'flex-start', columnGap: SPACING.md, flexDirection: 'row' }}>
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
          <Text variant="caption" color="textMuted">
            {formatDate(record.date)}
          </Text>
        </View>

        <Badge tone={STATUS_TONE[record.status]} tx={`status.${record.status}`} size="sm" />
      </View>

      {(record.odometer != null || record.cost != null || !!record.workshop) && (
        <View
          style={{
            borderTopColor: colors.divider,
            borderTopWidth: 1,
            columnGap: SPACING.lg,
            flexDirection: 'row',
            paddingTop: SPACING.md,
          }}
        >
          {record.odometer != null && (
            <View style={{ flex: 1, rowGap: 2 }}>
              <Text variant="caption" color="textMuted" tx="vehicle.odometer" />
              <Text variant="labelSm">{formatDistance(record.odometer)}</Text>
            </View>
          )}

          {record.cost != null && (
            <View style={{ flex: 1, rowGap: 2 }}>
              <Text variant="caption" color="textMuted" tx="common.cost" />
              <Text variant="labelSm">{formatCurrency(record.cost, record.currency)}</Text>
            </View>
          )}

          {!!record.workshop && (
            <View style={{ flex: 1.4, rowGap: 2 }}>
              <Text variant="caption" color="textMuted" tx="maintenance.workshop" />
              <Text variant="labelSm" numberOfLines={1}>
                {record.workshop}
              </Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}
