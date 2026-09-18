import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { ClimateServiceType } from '@/@types/models';
import type { ClimateServiceStatus } from '@/apis/repositories/climate';
import { Card, ProgressBar, Text } from '@/shared/components/ui';
import { formatDate, formatRelative } from '@/utils/format';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

const TYPE_ICON: Record<ClimateServiceType, FeatherIconName> = {
  cabinFilter: 'filter',
  acRegas: 'thermometer',
  acInspection: 'search',
  condenserClean: 'droplet',
  ventSanitize: 'wind',
  heaterService: 'sun',
};

export interface ClimateStatusCardProps {
  status: ClimateServiceStatus;
  onLog: () => void;
}

/**
 * Health of one climate service.
 *
 * Progress runs from the last service toward the next due date, so a full bar
 * means "do this now" rather than "this is complete".
 */
export default function ClimateStatusCard({ status, onLog }: ClimateStatusCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const tone = status.isOverdue ? 'danger' : status.progress > 0.75 ? 'warning' : 'success';
  const accent = colors[tone];

  return (
    <Card onPress={onLog} padding="lg" style={{ rowGap: SPACING.md }}>
      <View style={{ alignItems: 'flex-start', columnGap: SPACING.md, flexDirection: 'row' }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.accentTealSoft,
            borderRadius: RADIUS.md,
            height: 38,
            justifyContent: 'center',
            width: 38,
          }}
        >
          <Feather name={TYPE_ICON[status.type]} size={17} color={colors.accentTeal} />
        </View>

        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="h3" tx={`climate.types.${status.type}`} />
          <Text variant="caption" color="textMuted">
            {t('climate.everyMonths', { count: status.intervalMonths })}
          </Text>
        </View>

        <Feather
          name={status.isOverdue ? 'alert-circle' : 'check-circle'}
          size={18}
          color={accent}
        />
      </View>

      <ProgressBar
        value={status.progress}
        tone={tone}
        valueLabel={
          status.nextDueDate
            ? t('climate.nextDue', { when: formatDate(status.nextDueDate) })
            : t('climate.neverServiced')
        }
      />

      <Text variant="caption" color="textSecondary">
        {status.lastServiceDate
          ? t('climate.lastServiced', { when: formatRelative(status.lastServiceDate) })
          : t('climate.neverServiced')}
      </Text>
    </Card>
  );
}
