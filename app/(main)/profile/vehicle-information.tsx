import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { useDeleteVehicleMutation, useUpdateVehicleMutation } from '@/apis/autopilotApi';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import type { Vehicle } from '@/@types/models';
import { ConfirmDialog, Screen } from '@/shared/components/layout';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  SkeletonCard,
  Text,
} from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { formatDistance, formatRelative } from '@/utils/format';

export default function VehicleInformation() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { vehicles, vehicleId, isLoading, isFetching, refetch, selectVehicle } = useActiveVehicle();

  const [updateVehicle] = useUpdateVehicleMutation();
  const [deleteVehicle, { isLoading: isDeleting }] = useDeleteVehicleMutation();
  const [pendingDelete, setPendingDelete] = useState<Vehicle | undefined>();

  const handleSetPrimary = async (vehicle: Vehicle) => {
    try {
      await updateVehicle({ id: vehicle.id, patch: { isPrimary: true } }).unwrap();
      toast.success(t('vehicle.setPrimary'));
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.saveFailed';
      toast.error(t('errors.saveFailed'), t(message, { defaultValue: message }));
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteVehicle(pendingDelete.id).unwrap();
      toast.success(t('vehicle.deleteTitle'));
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.deleteFailed';
      toast.error(t('errors.deleteFailed'), t(message, { defaultValue: message }));
    } finally {
      setPendingDelete(undefined);
    }
  };

  return (
    <Screen
      scroll
      gap="md"
      refreshing={isFetching}
      onRefresh={refetch}
      header={{
        titleTx: 'profile.vehicleInformation',
        right: (
          <IconButton
            icon="plus"
            variant="soft"
            color="primary"
            backgroundColor="primarySoft"
            onPress={() => router.push('/(main)/vehicle/add')}
            accessibilityLabel={t('vehicle.addTitle')}
          />
        ),
      }}
    >
      {isLoading ? (
        <SkeletonCard count={2} />
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon="truck"
          titleTx="vehicle.emptyTitle"
          bodyTx="vehicle.emptyBody"
          actionTx="vehicle.addTitle"
          onAction={() => router.push('/(main)/vehicle/add')}
        />
      ) : (
        vehicles.map((vehicle) => {
          const isActive = vehicle.id === vehicleId;
          const displayName = vehicle.nickname || `${vehicle.make} ${vehicle.model}`;

          return (
            <Card
              key={vehicle.id}
              padding="lg"
              style={{
                borderColor: isActive ? colors.primary : colors.border,
                borderWidth: isActive ? 1.5 : 1,
                rowGap: SPACING.md,
              }}
            >
              <View
                style={{ alignItems: 'flex-start', columnGap: SPACING.md, flexDirection: 'row' }}
              >
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: isActive ? colors.primarySoft : colors.surfaceAlt,
                    borderRadius: RADIUS.md,
                    height: 44,
                    justifyContent: 'center',
                    width: 44,
                  }}
                >
                  <Feather
                    name="truck"
                    size={20}
                    color={isActive ? colors.primary : colors.textMuted}
                  />
                </View>

                <View style={{ flex: 1, rowGap: 2 }}>
                  <Text variant="h3" numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text variant="caption" color="textMuted" numberOfLines={1}>
                    {`${vehicle.make} ${vehicle.model} · ${vehicle.year}`}
                  </Text>
                </View>

                {vehicle.isPrimary && <Badge tone="primary" tx="vehicle.primary" size="sm" />}
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
                  <Text variant="caption" color="textMuted" tx="vehicle.odometer" />
                  <Text variant="labelSm">{formatDistance(vehicle.odometer)}</Text>
                </View>

                <View style={{ flex: 1, rowGap: 2 }}>
                  <Text variant="caption" color="textMuted" tx="vehicle.fuelType" />
                  <Text variant="labelSm" tx={`vehicle.fuelTypes.${vehicle.fuelType}`} />
                </View>

                {!!vehicle.plateNumber && (
                  <View style={{ flex: 1, rowGap: 2 }}>
                    <Text variant="caption" color="textMuted" tx="vehicle.plateNumber" />
                    <Text variant="labelSm" numberOfLines={1}>
                      {vehicle.plateNumber}
                    </Text>
                  </View>
                )}
              </View>

              {!!vehicle.odometerUpdatedAt && (
                <Text variant="caption" color="textMuted">
                  {t('vehicle.odometerUpdated', {
                    when: formatRelative(vehicle.odometerUpdatedAt),
                  })}
                </Text>
              )}

              <View style={{ alignItems: 'center', columnGap: SPACING.sm, flexDirection: 'row' }}>
                {!isActive && (
                  <Button
                    variant="secondary"
                    size="sm"
                    tx="vehicle.select"
                    onPress={() => selectVehicle(vehicle.id)}
                    style={{ flex: 1 }}
                  />
                )}

                {!vehicle.isPrimary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    tx="vehicle.setPrimary"
                    onPress={() => handleSetPrimary(vehicle)}
                    style={{ flex: 1 }}
                  />
                )}

                <IconButton
                  icon="edit-2"
                  size="sm"
                  color="textSecondary"
                  onPress={() => router.push(`/(main)/vehicle/${vehicle.id}` as never)}
                  accessibilityLabel={t('common.edit')}
                />
                <IconButton
                  icon="trash-2"
                  size="sm"
                  color="danger"
                  onPress={() => setPendingDelete(vehicle)}
                  accessibilityLabel={t('common.delete')}
                />
              </View>
            </Card>
          );
        })
      )}

      <ConfirmDialog
        isVisible={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(undefined)}
        onConfirm={handleDelete}
        titleTx="vehicle.deleteTitle"
        bodyTx="vehicle.deleteBody"
        confirmTx="common.delete"
        tone="danger"
        icon="trash-2"
        loading={isDeleting}
      />
    </Screen>
  );
}
