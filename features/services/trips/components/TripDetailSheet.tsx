import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { useToggleTripChecklistItemMutation } from '@/apis/autopilotApi';
import type { Trip, TripEstimate } from '@/@types/models';
import { Sheet } from '@/shared/components/layout';
import { Button, Checkbox, Divider, StatTile, Text } from '@/shared/components/ui';
import {
  formatCurrency,
  formatDate,
  formatDistance,
  formatEfficiency,
  formatVolume,
} from '@/utils/format';

export interface TripDetailSheetProps {
  trip?: Trip;
  estimate?: TripEstimate;
  /** The economy figure the estimate was derived from, shown for transparency. */
  economyKmPerLiter: number;
  /** True when economy is a fallback rather than measured from real fill-ups. */
  isEconomyAssumed: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Full trip breakdown: estimate, pre-departure checklist and blockers. */
export default function TripDetailSheet({
  trip,
  estimate,
  economyKmPerLiter,
  isEconomyAssumed,
  onClose,
  onEdit,
  onDelete,
}: TripDetailSheetProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [toggleItem] = useToggleTripChecklistItemMutation();

  if (!trip || !estimate) {
    return null;
  }

  const totalDistance = trip.distanceKm * (trip.isRoundTrip ? 2 : 1);

  return (
    <Sheet
      isVisible={Boolean(trip)}
      onClose={onClose}
      titleTx={undefined}
      maxHeightRatio={0.92}
      footer={
        <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
          <Button variant="dangerGhost" tx="common.delete" onPress={onDelete} />
          <Button tx="common.edit" onPress={onEdit} style={{ flex: 1 }} />
        </View>
      }
    >
      <View style={{ rowGap: SPACING.xs }}>
        <Text variant="h1">{trip.name}</Text>
        <Text variant="body" color="textSecondary">
          {`${trip.origin} → ${trip.destination}`}
        </Text>
        <Text variant="caption" color="textMuted">
          {[formatDate(trip.departureDate), trip.returnDate ? formatDate(trip.returnDate) : null]
            .filter(Boolean)
            .join(' — ')}
        </Text>
      </View>

      <Divider />

      <View style={{ rowGap: SPACING.md }}>
        <Text variant="h2" tx="trips.estimateTitle" />

        <View style={{ columnGap: SPACING.sm, flexDirection: 'row' }}>
          <StatTile
            value={formatCurrency(estimate.estimatedFuelCost, trip.currency)}
            labelTx="trips.fuelCost"
            tone="primary"
          />
          <StatTile value={formatVolume(estimate.estimatedLiters)} labelTx="trips.fuelNeeded" />
        </View>

        <View style={{ columnGap: SPACING.sm, flexDirection: 'row' }}>
          <StatTile
            value={formatCurrency(estimate.costPerTraveller, trip.currency)}
            labelTx="trips.perPerson"
          />
          <StatTile value={String(estimate.refuelStops)} labelTx="trips.refuelStops" />
          <StatTile value={formatDistance(totalDistance)} labelTx="trips.distance" />
        </View>

        <Text variant="caption" color="textMuted">
          {t(isEconomyAssumed ? 'trips.assumedEconomy' : 'trips.basedOnEconomy', {
            economy: formatEfficiency(economyKmPerLiter),
          })}
        </Text>
      </View>

      {estimate.blockingIssues.length > 0 && (
        <View
          style={{
            backgroundColor: colors.warningSoft,
            borderRadius: RADIUS.md,
            padding: SPACING.lg,
            rowGap: SPACING.sm,
          }}
        >
          <View style={{ alignItems: 'center', columnGap: SPACING.sm, flexDirection: 'row' }}>
            <Feather name="alert-triangle" size={16} color={colors.warning} />
            <Text variant="label" color="warning" tx="trips.blockersTitle" />
          </View>

          <Text variant="bodySm" color="textSecondary" tx="trips.blockersBody" />

          <View style={{ rowGap: SPACING.xs }}>
            {estimate.blockingIssues.map((issue) => (
              <Text key={issue} variant="bodySm" color="textSecondary">
                {`• ${issue}`}
              </Text>
            ))}
          </View>
        </View>
      )}

      <Divider />

      <View style={{ rowGap: SPACING.md }}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text variant="h2" tx="trips.checklistTitle" />
          <Text variant="labelSm" color="primary">
            {t('trips.checklistProgress', {
              done: trip.checklist.filter((item) => item.isDone).length,
              total: trip.checklist.length,
            })}
          </Text>
        </View>

        <View style={{ rowGap: SPACING.md }}>
          {trip.checklist.map((item) => (
            <Checkbox
              key={item.id}
              value={item.isDone}
              onChange={() => toggleItem({ tripId: trip.id, itemId: item.id })}
              labelTx={item.labelKey}
            />
          ))}
        </View>
      </View>

      {!!trip.notes && (
        <>
          <Divider />
          <View style={{ rowGap: SPACING.xs }}>
            <Text variant="label" color="textSecondary" tx="common.notes" />
            <Text variant="bodySm" color="textSecondary">
              {trip.notes}
            </Text>
          </View>
        </>
      )}
    </Sheet>
  );
}
