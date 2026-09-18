import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { FuelStatistics } from '@/@types/models';
import { Card, SectionHeader, Text } from '@/shared/components/ui';
import { formatDistance, formatEfficiency, formatVolume } from '@/utils/format';

export interface FuelSnapshotProps {
  statistics: FuelStatistics;
  onPress: () => void;
}

/**
 * Home-screen fuel summary: the headline economy number plus the direction it
 * is moving, which is the part that actually tells the driver something.
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
        <View style={{ alignItems: 'flex-end', columnGap: SPACING.md, flexDirection: 'row' }}>
          <View style={{ flex: 1, rowGap: SPACING.xxs }}>
            <Text variant="overline" color="textMuted" tx="fuel.stats.average" />
            <Text variant="metricLg" color="primary">
              {formatEfficiency(statistics.averageKmPerLiter)}
            </Text>
          </View>

          {hasTrend && (
            <View
              style={{
                alignItems: 'center',
                columnGap: SPACING.xs,
                flexDirection: 'row',
                paddingBottom: SPACING.xs,
              }}
            >
              <Feather
                name={isImproving ? 'trending-up' : 'trending-down'}
                size={16}
                color={trendTone}
              />
              <Text variant="labelSm" rawColor={trendTone}>
                {t(isImproving ? 'fuel.stats.trendUp' : 'fuel.stats.trendDown', {
                  percent: Math.abs(Math.round(statistics.trendPercent)),
                })}
              </Text>
            </View>
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
            <Text variant="caption" color="textMuted" tx="fuel.stats.totalDistance" />
            <Text variant="metricSm">{formatDistance(statistics.totalDistanceKm)}</Text>
          </View>

          <View style={{ flex: 1, rowGap: 2 }}>
            <Text variant="caption" color="textMuted" tx="fuel.stats.totalLiters" />
            <Text variant="metricSm">{formatVolume(statistics.totalLiters)}</Text>
          </View>

          <View style={{ flex: 1, rowGap: 2 }}>
            <Text variant="caption" color="textMuted" tx="fuel.stats.best" />
            <Text variant="metricSm" color="success">
              {formatEfficiency(statistics.bestKmPerLiter)}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
}
