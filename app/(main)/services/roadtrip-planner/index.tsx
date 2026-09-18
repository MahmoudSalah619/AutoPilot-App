import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { SPACING } from '@/constants/Layout';
import {
  useDeleteTripMutation,
  useGetDocumentsQuery,
  useGetFuelEntriesQuery,
  useGetRemindersQuery,
  useGetTripsQuery,
} from '@/apis/autopilotApi';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import type { Trip } from '@/@types/models';
import { estimateTrip, findTripBlockers } from '@/utils/domain';
import { ConfirmDialog, Screen } from '@/shared/components/layout';
import { Card, EmptyState, Fab, SectionHeader, SkeletonCard } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { TripCard, TripDetailSheet, TripSheet } from '@/features/services/trips';

/** Used when there is not enough fuel history to measure real economy. */
const FALLBACK_ECONOMY = 12;

export default function RoadtripPlanner() {
  const { t } = useTranslation();
  const { vehicle, hasVehicle } = useActiveVehicle();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | undefined>();
  const [selectedTrip, setSelectedTrip] = useState<Trip | undefined>();
  const [pendingDelete, setPendingDelete] = useState<Trip | undefined>();

  const {
    data: trips = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetTripsQuery(vehicle?.id, { skip: !vehicle });

  const { data: fuel } = useGetFuelEntriesQuery(vehicle ? { vehicleId: vehicle.id } : undefined, {
    skip: !vehicle,
  });
  const { data: reminders = [] } = useGetRemindersQuery(
    vehicle ? { vehicleId: vehicle.id } : undefined,
    { skip: !vehicle }
  );
  const { data: documents = [] } = useGetDocumentsQuery(
    vehicle ? { vehicleId: vehicle.id } : undefined,
    { skip: !vehicle }
  );

  const [deleteTrip, { isLoading: isDeleting }] = useDeleteTripMutation();

  const measuredEconomy = fuel?.statistics.averageKmPerLiter ?? 0;
  const isEconomyAssumed = measuredEconomy <= 0;
  const economy = isEconomyAssumed ? FALLBACK_ECONOMY : measuredEconomy;

  /** Estimates are derived per trip and memoized alongside their blockers. */
  const estimates = useMemo(() => {
    const map = new Map<string, ReturnType<typeof estimateTrip>>();

    trips.forEach((trip) => {
      const blockers = findTripBlockers(trip, reminders, documents);
      map.set(trip.id, estimateTrip(trip, economy, vehicle, blockers));
    });

    return map;
  }, [trips, reminders, documents, economy, vehicle]);

  const { upcoming, past } = useMemo(() => {
    const today = dayjs().startOf('day');

    return {
      upcoming: trips.filter((trip) => !dayjs(trip.departureDate).isBefore(today)),
      past: trips.filter((trip) => dayjs(trip.departureDate).isBefore(today)),
    };
  }, [trips]);

  const openCreate = () => {
    setEditingTrip(undefined);
    setIsSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteTrip(pendingDelete.id).unwrap();
      toast.success(t('trips.deleteTitle'));
      setSelectedTrip(undefined);
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.deleteFailed';
      toast.error(t('errors.deleteFailed'), t(message, { defaultValue: message }));
    } finally {
      setPendingDelete(undefined);
    }
  };

  const header = {
    titleTx: 'trips.title',
    subtitleTx: 'trips.subtitle',
    variant: 'large' as const,
  };

  if (!hasVehicle) {
    return (
      <Screen header={header}>
        <EmptyState icon="truck" titleTx="vehicle.emptyTitle" bodyTx="vehicle.emptyBody" />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      gap="xxl"
      header={header}
      refreshing={isFetching}
      onRefresh={refetch}
      contentStyle={{ paddingBottom: 120 }}
      overlay={
        <Fab
          aboveTabBar={false}
          onPress={openCreate}
          labelTx="trips.addTitle"
          accessibilityLabel={t('trips.addTitle')}
        />
      }
    >
      {isLoading ? (
        <SkeletonCard count={3} />
      ) : trips.length === 0 ? (
        <Card variant="outlined">
          <EmptyState
            layout="inline"
            icon="map"
            titleTx="trips.emptyTitle"
            bodyTx="trips.emptyBody"
            actionTx="trips.addTitle"
            onAction={openCreate}
          />
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <View style={{ rowGap: SPACING.md }}>
              <SectionHeader titleTx="trips.upcomingTrips" icon="navigation" />

              {upcoming.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  estimate={estimates.get(trip.id)!}
                  onPress={() => setSelectedTrip(trip)}
                />
              ))}
            </View>
          )}

          {past.length > 0 && (
            <View style={{ rowGap: SPACING.md }}>
              <SectionHeader titleTx="trips.pastTrips" icon="clock" />

              {past.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  estimate={estimates.get(trip.id)!}
                  onPress={() => setSelectedTrip(trip)}
                />
              ))}
            </View>
          )}
        </>
      )}

      {!!vehicle && (
        <TripSheet
          isVisible={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          vehicleId={vehicle.id}
          lastFuelPrice={fuel?.entries[0]?.pricePerLiter}
          trip={editingTrip}
        />
      )}

      <TripDetailSheet
        trip={selectedTrip}
        estimate={selectedTrip ? estimates.get(selectedTrip.id) : undefined}
        economyKmPerLiter={economy}
        isEconomyAssumed={isEconomyAssumed}
        onClose={() => setSelectedTrip(undefined)}
        onEdit={() => {
          setEditingTrip(selectedTrip);
          setSelectedTrip(undefined);
          setIsSheetOpen(true);
        }}
        onDelete={() => setPendingDelete(selectedTrip)}
      />

      <ConfirmDialog
        isVisible={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(undefined)}
        onConfirm={handleDelete}
        titleTx="trips.deleteTitle"
        bodyTx="trips.deleteBody"
        confirmTx="common.delete"
        tone="danger"
        icon="trash-2"
        loading={isDeleting}
      />
    </Screen>
  );
}
