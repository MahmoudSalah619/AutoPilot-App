import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { FuelStatistics } from '@/@types/models';
import { Card, Text } from '@/shared/components/ui';
import { formatCurrency, formatDistance, formatNumber, formatVolume } from '@/utils/format';

export interface FuelStatsSummaryProps {
  statistics: FuelStatistics;
}

/** One figure in the bottom row. */
function Figure({ labelTx, value }: { labelTx: string; value: string }) {
  return (
    <View style={{ flex: 1, rowGap: SPACING.xxs }}>
      <Text variant="caption" color="textMuted" tx={labelTx} numberOfLines={1} />
      <Text variant="metricSm" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

/**
 * The fuel economy summary.
 *
 * Six equal tiles read as a wall of numbers, so this gives the average the
 * whole top of the card — it is the figure the screen exists for — puts best
 * and worst on a range bar where their relationship is the point, and leaves
 * the cumulative totals as a quiet footer row.
 */
export default function FuelStatsSummary({ statistics }: FuelStatsSummaryProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const { averageKmPerLiter, bestKmPerLiter, worstKmPerLiter, trendPercent } = statistics;

  const hasTrend = Math.abs(trendPercent) >= 1;
  const isImproving = trendPercent > 0;
  const trendTone = isImproving ? colors.success : colors.danger;

  const spread = bestKmPerLiter - worstKmPerLiter;
  /** Where the average sits between worst and best, as a fraction. */
  const markerRatio =
    spread > 0 ? Math.min(1, Math.max(0, (averageKmPerLiter - worstKmPerLiter) / spread)) : 0.5;

  const hasRange = bestKmPerLiter > 0 && spread > 0;

  return (
    <Card padding="lg" style={{ rowGap: SPACING.lg }}>
      <View style={{ rowGap: SPACING.xs }}>
        <View style={{ alignItems: 'center', columnGap: SPACING.sm, flexDirection: 'row' }}>
          <Text variant="overline" color="textMuted" tx="fuel.stats.headline" style={{ flex: 1 }} />

          {hasTrend && (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: isImproving ? colors.successSoft : colors.dangerSoft,
                borderRadius: RADIUS.pill,
                columnGap: SPACING.xxs,
                flexDirection: 'row',
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
                {`${isImproving ? '+' : '−'}${Math.abs(Math.round(trendPercent))}%`}
              </Text>
            </View>
          )}
        </View>

        <View style={{ alignItems: 'baseline', columnGap: SPACING.xs, flexDirection: 'row' }}>
          <Text variant="metricLg" color="primary">
            {formatNumber(averageKmPerLiter, 1)}
          </Text>
          <Text variant="label" color="textSecondary" tx="units.kmPerLiter" />
        </View>

        <Text variant="caption" color="textMuted">
          {t('fuel.stats.basis', { logged: statistics.entryCount })}
        </Text>
      </View>

      {/* Best and worst mean something as a spread, not as two separate tiles. */}
      {hasRange && (
        <View
          style={{
            borderTopColor: colors.divider,
            borderTopWidth: 1,
            paddingTop: SPACING.md,
            rowGap: SPACING.sm,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="caption" color="textSecondary">
              {`${t('fuel.stats.worst')} · ${formatNumber(worstKmPerLiter, 1)}`}
            </Text>
            <Text variant="caption" color="textSecondary">
              {`${t('fuel.stats.best')} · ${formatNumber(bestKmPerLiter, 1)}`}
            </Text>
          </View>

          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={t('fuel.stats.rangeA11y', {
              worst: formatNumber(worstKmPerLiter, 1),
              best: formatNumber(bestKmPerLiter, 1),
            })}
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: RADIUS.pill,
              height: 6,
              justifyContent: 'center',
            }}
          >
            {/* Filled to the marker, so the fill reads as "how close to best". */}
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: RADIUS.pill,
                height: 6,
                width: `${markerRatio * 100}%`,
              }}
            />
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.primary,
                borderRadius: RADIUS.pill,
                borderWidth: 3,
                height: 14,
                position: 'absolute',
                // Nudged back by half the dot so it centres on the value.
                start: `${markerRatio * 100}%`,
                marginStart: -7,
                width: 14,
              }}
            />
          </View>
        </View>
      )}

      <View
        style={{
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          columnGap: SPACING.md,
          flexDirection: 'row',
          paddingTop: SPACING.md,
        }}
      >
        <Figure
          labelTx="fuel.stats.totalDistance"
          value={formatDistance(statistics.totalDistanceKm)}
        />
        <Figure labelTx="fuel.stats.totalLiters" value={formatVolume(statistics.totalLiters)} />
        <Figure
          labelTx="fuel.stats.totalCost"
          value={formatCurrency(statistics.totalCost, 'EGP')}
        />
      </View>
    </Card>
  );
}
