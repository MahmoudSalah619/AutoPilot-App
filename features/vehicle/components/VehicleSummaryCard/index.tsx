import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { Vehicle } from '@/@types/models';
import { Badge, Button, Card, Text } from '@/shared/components/ui';
import { formatDistance, formatRelative } from '@/utils/format';

export interface VehicleSummaryCardProps {
  vehicle: Vehicle;
  /** Opens the odometer sheet. */
  onUpdateOdometer?: () => void;
  /** Opens the vehicle switcher; omitted when the user has only one car. */
  onSwitchVehicle?: () => void;
  onPress?: () => void;
}

/**
 * Hero card on the home screen: which car, how far it has gone, and the one
 * action the driver takes most often.
 */
export default function VehicleSummaryCard({
  vehicle,
  onUpdateOdometer,
  onSwitchVehicle,
  onPress,
}: VehicleSummaryCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const displayName = vehicle.nickname || `${vehicle.make} ${vehicle.model}`;
  const subtitle = vehicle.nickname
    ? `${vehicle.make} ${vehicle.model} · ${vehicle.year}`
    : String(vehicle.year);

  return (
    <Card padding="xl" style={{ rowGap: SPACING.xl }}>
      <View style={{ alignItems: 'flex-start', columnGap: SPACING.md, flexDirection: 'row' }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.primarySoft,
            borderRadius: RADIUS.md,
            height: 48,
            justifyContent: 'center',
            width: 48,
          }}
        >
          <Feather name="truck" size={22} color={colors.primary} />
        </View>

        <View style={{ flex: 1, rowGap: SPACING.xxs }}>
          <Text variant="h1" numberOfLines={1}>
            {displayName}
          </Text>
          <Text variant="bodySm" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        {!!onSwitchVehicle && (
          <Button
            variant="ghost"
            size="sm"
            tx="vehicle.vehicles"
            rightIcon={<Feather name="chevron-down" size={14} color={colors.primary} />}
            onPress={onSwitchVehicle}
          />
        )}
      </View>

      <View
        style={{
          alignItems: 'flex-end',
          columnGap: SPACING.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ rowGap: SPACING.xxs }}>
          <Text variant="overline" color="textMuted" tx="vehicle.odometer" />
          <Text variant="metricLg">{formatDistance(vehicle.odometer)}</Text>
          {!!vehicle.odometerUpdatedAt && (
            <Text variant="caption" color="textMuted">
              {t('vehicle.odometerUpdated', { when: formatRelative(vehicle.odometerUpdatedAt) })}
            </Text>
          )}
        </View>

        {vehicle.isPrimary && <Badge tone="primary" tx="vehicle.primary" size="sm" />}
      </View>

      <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
        {!!onUpdateOdometer && (
          <Button
            variant="secondary"
            tx="home.updateOdometer"
            leftIcon={<Feather name="edit-3" size={16} color={colors.primary} />}
            onPress={onUpdateOdometer}
            style={{ flex: 1 }}
          />
        )}
        {!!onPress && (
          <Button variant="outline" tx="common.edit" onPress={onPress} style={{ flex: 1 }} />
        )}
      </View>
    </Card>
  );
}
