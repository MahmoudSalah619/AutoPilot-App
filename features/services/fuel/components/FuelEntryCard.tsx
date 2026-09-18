import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { FuelEntry } from '@/@types/models';
import { Badge, Card, IconButton, Text } from '@/shared/components/ui';
import { entryEfficiency, efficiencyTone } from '@/utils/domain';
import {
  formatCurrency,
  formatDate,
  formatDistance,
  formatEfficiency,
  formatVolume,
} from '@/utils/format';

export interface FuelEntryCardProps {
  entry: FuelEntry;
  /** Fleet average, used to tone this entry's efficiency badge. */
  averageKmPerLiter: number;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * One fill-up.
 *
 * Partial fills are labelled rather than showing a misleading economy figure —
 * the distance since the last fill was not all covered by this much fuel.
 */
export default function FuelEntryCard({
  entry,
  averageKmPerLiter,
  onEdit,
  onDelete,
}: FuelEntryCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const efficiency = entryEfficiency(entry);
  const canShowEfficiency = entry.isFullTank && efficiency > 0;

  return (
    <Card padding="lg" style={{ rowGap: SPACING.md }}>
      <View style={{ alignItems: 'center', columnGap: SPACING.sm, flexDirection: 'row' }}>
        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="h3">{formatDate(entry.date)}</Text>
          {!!entry.stationName && (
            <Text variant="caption" color="textMuted" numberOfLines={1}>
              {entry.stationName}
            </Text>
          )}
        </View>

        {canShowEfficiency ? (
          <Badge
            tone={efficiencyTone(efficiency, averageKmPerLiter)}
            label={formatEfficiency(efficiency)}
            size="sm"
          />
        ) : (
          <Badge tone="neutral" tx="fuel.partialFill" size="sm" />
        )}
      </View>

      <View
        style={{
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          flexDirection: 'row',
          paddingTop: SPACING.md,
        }}
      >
        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="caption" color="textMuted" tx="fuel.distanceSince" />
          <Text variant="labelSm">{formatDistance(entry.distanceKm)}</Text>
        </View>

        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="caption" color="textMuted" tx="fuel.liters" />
          <Text variant="labelSm">{formatVolume(entry.liters)}</Text>
        </View>

        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="caption" color="textMuted" tx="fuel.totalCost" />
          <Text variant="labelSm">
            {entry.totalCost != null ? formatCurrency(entry.totalCost, entry.currency) : '—'}
          </Text>
        </View>
      </View>

      <View
        style={{
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          columnGap: SPACING.xs,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingTop: SPACING.sm,
        }}
      >
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
