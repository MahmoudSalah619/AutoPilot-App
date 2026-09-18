import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { FuelStatistics } from '@/@types/models';
import { Card, SectionHeader, Text } from '@/shared/components/ui';
import { formatCurrency, formatDistance, formatNumber } from '@/utils/format';

export interface FuelSnapshotProps {
  statistics: FuelStatistics;
  onPress: () => void;
}

/**
 * Home-screen fuel summary.
 *
 * Deliberately only three numbers: the headline economy figure, the direction
 * it is moving, and what the driving has cost. Best and worst belong on the
 * fuel screen, where there is room to show them as a range.
 */
export default function FuelSnapshot({ statistics, onPress }: FuelSnapshotProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const hasTrend = Math.abs(statistics.trendPercent) >= 1;
  const isImproving = statistics.trendPercent > 0;
  const trendTone = isImproving ? colors.success : colors.danger;

  return (
    <View style={{ rowGap: SPACING.md }}>
      <SectionHeader
        titleTx="home.fuelSnapshot"
        icon="droplet"
        actionTx="common.seeAll"
        onAction={onPress}
      />

      <Card onPress={onPress} padding="xl" style={{ rowGap: SPACING.lg }}>
        <View style={{ alignItems: 'flex-start', columnGap: SPACING.md, flexDirection: 'row' }}>
          <View style={{ flex: 1, rowGap: SPACING.xxs }}>
            <Text variant="overline" color="textMuted" tx="fuel.stats.headline" />

            <View style={{ alignItems: 'baseline', columnGap: SPACING.xs, flexDirection: 'row' }}>
              <Text variant="metricLg" color="primary">
                {formatNumber(statistics.averageKmPerLiter, 1)}
              </Text>
              <Text variant="label" color="textSecondary" tx="units.kmPerLiter" />
            </View>
          </View>

          {hasTrend && (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: isImproving ? colors.successSoft : colors.dangerSoft,
                borderRadius: RADIUS.pill,
                columnGap: SPACING.xxs,
                flexDirection: 'row',
                marginTop: SPACING.xs,
                paddingHorizontal: SPACING.sm,
                paddingVertical: 3,
              }}
            >
              <Feather
                name={isImproving ? 'trending-up' : 'trending-down'}
                size={12}
                color={trendTone}
              />
              <Text variant="caption" rawColor={trendTone}>
                {`${isImproving ? '+' : '−'}${Math.abs(Math.round(statistics.trendPercent))}%`}
              </Text>
            </View>
          )}
        </View>

        <View
          style={{
            borderTopColor: colors.divider,
            borderTopWidth: 1,
            columnGap: SPACING.lg,
            flexDirection: 'row',
            paddingTop: SPACING.md,
          }}
        >
          <View style={{ flex: 1, rowGap: 2 }}>
            <Text variant="caption" color="textMuted" tx="fuel.stats.totalDistance" />
            <Text variant="metricSm" numberOfLines={1}>
              {formatDistance(statistics.totalDistanceKm)}
            </Text>
          </View>

          <View style={{ flex: 1, rowGap: 2 }}>
            <Text variant="caption" color="textMuted" tx="fuel.stats.totalCost" />
            <Text variant="metricSm" numberOfLines={1}>
              {formatCurrency(statistics.totalCost, 'EGP')}
            </Text>
          </View>
        </View>

        <Text variant="caption" color="textMuted">
          {t('fuel.stats.basis', { logged: statistics.entryCount })}
        </Text>
      </Card>
    </View>
  );
}
