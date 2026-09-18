import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useDeleteFuelEntryMutation, useGetFuelEntriesQuery } from '@/apis/autopilotApi';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import type { FuelEntry } from '@/@types/models';
import { ConfirmDialog, Screen } from '@/shared/components/layout';
import {
  Card,
  Chip,
  EmptyState,
  Fab,
  IconButton,
  SkeletonCard,
  StatTile,
  Text,
} from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import {
  DateRangeSheet,
  FuelEntryCard,
  FuelEntrySheet,
  type DateRange,
} from '@/features/services/fuel';
import {
  formatCurrency,
  formatDate,
  formatDistance,
  formatEfficiency,
  formatVolume,
} from '@/utils/format';

export default function GasConsumption() {
  const { t } = useTranslation();
  const { vehicle, hasVehicle } = useActiveVehicle();

  const [range, setRange] = useState<DateRange>({});
  const [isEntrySheetOpen, setIsEntrySheetOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FuelEntry | undefined>();
  const [pendingDelete, setPendingDelete] = useState<FuelEntry | undefined>();

  const queryArgs = useMemo(
    () => (vehicle ? { vehicleId: vehicle.id, from: range.from, to: range.to } : undefined),
    [vehicle, range]
  );

  const { data, isLoading, isFetching, refetch } = useGetFuelEntriesQuery(queryArgs, {
    skip: !vehicle,
  });

  const [deleteEntry, { isLoading: isDeleting }] = useDeleteFuelEntryMutation();

  const entries = data?.entries ?? [];
  const statistics = data?.statistics;
  const isFiltered = Boolean(range.from || range.to);

  const openCreate = () => {
    setEditingEntry(undefined);
    setIsEntrySheetOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteEntry(pendingDelete.id).unwrap();
      toast.success(t('fuel.deleteTitle'));
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.deleteFailed';
      toast.error(t('errors.deleteFailed'), t(message, { defaultValue: message }));
    } finally {
      setPendingDelete(undefined);
    }
  };

  const header = {
    titleTx: 'fuel.title',
    subtitleTx: 'fuel.subtitle',
    variant: 'large' as const,
    right: (
      <IconButton
        icon="filter"
        variant={isFiltered ? 'soft' : 'plain'}
        color={isFiltered ? 'primary' : 'textSecondary'}
        backgroundColor="primarySoft"
        onPress={() => setIsFilterOpen(true)}
        accessibilityLabel={t('common.filters')}
      />
    ),
  };

  if (!hasVehicle) {
    return (
      <Screen header={header}>
        <EmptyState icon="truck" titleTx="vehicle.emptyTitle" bodyTx="vehicle.emptyBody" />
      </Screen>
    );
  }

  const hasEnoughData = (statistics?.entryCount ?? 0) >= 2;

  return (
    <Screen
      padded={false}
      header={header}
      overlay={
        <Fab
          aboveTabBar={false}
          onPress={openCreate}
          labelTx="fuel.addTitle"
          accessibilityLabel={t('fuel.addTitle')}
        />
      }
    >
      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.id}
        renderItem={({ item }) => (
          <FuelEntryCard
            entry={item}
            averageKmPerLiter={statistics?.averageKmPerLiter ?? 0}
            onEdit={() => {
              setEditingEntry(item);
              setIsEntrySheetOpen(true);
            }}
            onDelete={() => setPendingDelete(item)}
          />
        )}
        contentContainerStyle={{
          paddingBottom: 140,
          paddingHorizontal: SPACING.screen,
          rowGap: SPACING.md,
        }}
        showsVerticalScrollIndicator={false}
        refreshing={isFetching}
        onRefresh={refetch}
        ListHeaderComponent={
          <View style={{ rowGap: SPACING.md, paddingBottom: SPACING.md }}>
            {isFiltered && (
              <Chip
                icon="calendar"
                label={`${range.from ? formatDate(range.from) : '…'} → ${range.to ? formatDate(range.to) : '…'}`}
                onRemove={() => setRange({})}
              />
            )}

            {hasEnoughData && !!statistics ? (
              <Card padding="lg" style={{ rowGap: SPACING.md }}>
                <View style={{ columnGap: SPACING.sm, flexDirection: 'row' }}>
                  <StatTile
                    variant="plain"
                    value={formatEfficiency(statistics.averageKmPerLiter)}
                    labelTx="fuel.stats.average"
                    tone="primary"
                  />
                  <StatTile
                    variant="plain"
                    value={formatEfficiency(statistics.bestKmPerLiter)}
                    labelTx="fuel.stats.best"
                    tone="success"
                  />
                  <StatTile
                    variant="plain"
                    value={formatEfficiency(statistics.worstKmPerLiter)}
                    labelTx="fuel.stats.worst"
                    tone="danger"
                  />
                </View>

                <View style={{ columnGap: SPACING.sm, flexDirection: 'row' }}>
                  <StatTile
                    variant="plain"
                    value={formatDistance(statistics.totalDistanceKm)}
                    labelTx="fuel.stats.totalDistance"
                  />
                  <StatTile
                    variant="plain"
                    value={formatVolume(statistics.totalLiters)}
                    labelTx="fuel.stats.totalLiters"
                  />
                  <StatTile
                    variant="plain"
                    value={formatCurrency(statistics.totalCost, 'EGP')}
                    labelTx="fuel.stats.totalCost"
                  />
                </View>
              </Card>
            ) : entries.length > 0 ? (
              <Card variant="flat">
                <View style={{ rowGap: SPACING.xs }}>
                  <Text variant="h3" tx="fuel.needMoreDataTitle" />
                  <Text variant="bodySm" color="textSecondary" tx="fuel.needMoreDataBody" />
                </View>
              </Card>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <SkeletonCard count={4} />
          ) : (
            <EmptyState
              layout="inline"
              icon="droplet"
              titleTx="fuel.emptyTitle"
              bodyTx="fuel.emptyBody"
              actionTx="fuel.addTitle"
              onAction={openCreate}
            />
          )
        }
      />

      {!!vehicle && (
        <FuelEntrySheet
          isVisible={isEntrySheetOpen}
          onClose={() => setIsEntrySheetOpen(false)}
          vehicleId={vehicle.id}
          lastOdometer={entries[0]?.odometer ?? vehicle.odometer}
          entry={editingEntry}
        />
      )}

      <DateRangeSheet
        isVisible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        value={range}
        onApply={setRange}
      />

      <ConfirmDialog
        isVisible={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(undefined)}
        onConfirm={handleDelete}
        titleTx="fuel.deleteTitle"
        bodyTx="fuel.deleteBody"
        confirmTx="common.delete"
        tone="danger"
        icon="trash-2"
        loading={isDeleting}
      />
    </Screen>
  );
}
