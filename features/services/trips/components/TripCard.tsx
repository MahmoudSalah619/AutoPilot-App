import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { Trip, TripEstimate } from '@/@types/models';
import { Badge, Card, ProgressBar, Text } from '@/shared/components/ui';
import { formatCurrency, formatDate, formatDistance, formatVolume } from '@/utils/format';

export interface TripCardProps {
  trip: Trip;
  estimate: TripEstimate;
  onPress: () => void;
}

/**
 * Trip summary.
 *
 * Leads with the fuel cost, since that is the number that decides whether the
 * trip happens, and flags anything falling due before the return date.
 */
export default function TripCard({ trip, estimate, onPress }: TripCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const doneCount = trip.checklist.filter((item) => item.isDone).length;
  const checklistProgress = trip.checklist.length ? doneCount / trip.checklist.length : 0;
  const totalDistance = trip.distanceKm * (trip.isRoundTrip ? 2 : 1);

  return (
    <Card onPress={onPress} padding="lg" style={{ rowGap: SPACING.md }}>
      <View style={{ alignItems: 'flex-start', columnGap: SPACING.md, flexDirection: 'row' }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.accentGreenSoft,
            borderRadius: RADIUS.md,
            height: 40,
            justifyContent: 'center',
            width: 40,
          }}
        >
          <Feather name="map" size={18} color={colors.accentGreen} />
        </View>

        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="h3" numberOfLines={1}>
            {trip.name}
          </Text>
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {`${trip.origin} → ${trip.destination}`}
          </Text>
        </View>

        {trip.isRoundTrip && <Badge tone="neutral" tx="trips.roundTrip" size="sm" />}
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
          <Text variant="caption" color="textMuted" tx="trips.fuelCost" />
          <Text variant="metricSm" color="primary">
            {formatCurrency(estimate.estimatedFuelCost, trip.currency)}
          </Text>
        </View>

        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="caption" color="textMuted" tx="trips.fuelNeeded" />
          <Text variant="metricSm">{formatVolume(estimate.estimatedLiters)}</Text>
        </View>

        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="caption" color="textMuted" tx="trips.distance" />
          <Text variant="metricSm">{formatDistance(totalDistance)}</Text>
        </View>
      </View>

      <ProgressBar
        value={checklistProgress}
        tone={checklistProgress === 1 ? 'success' : 'primary'}
        labelTx="trips.checklistTitle"
        valueLabel={t('trips.checklistProgress', {
          done: doneCount,
          total: trip.checklist.length,
        })}
      />

      <View style={{ alignItems: 'center', columnGap: SPACING.sm, flexDirection: 'row' }}>
        <Feather name="calendar" size={14} color={colors.textMuted} />
        <Text variant="caption" color="textMuted">
          {formatDate(trip.departureDate)}
        </Text>

        {estimate.blockingIssues.length > 0 && (
          <Badge
            tone="warning"
            size="sm"
            withDot
            label={String(estimate.blockingIssues.length)}
            style={{ marginStart: 'auto' }}
          />
        )}
      </View>
    </Card>
  );
}
