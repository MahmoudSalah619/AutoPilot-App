import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import {
  useCompleteReminderMutation,
  useDeleteReminderMutation,
  useGetRemindersQuery,
} from '@/apis/autopilotApi';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import type { ServiceReminder } from '@/@types/models';
import { ConfirmDialog, Screen } from '@/shared/components/layout';
import { EmptyState, Fab, SegmentedControl, SkeletonCard, StatTile } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { ReminderCard, ReminderSheet } from '@/features/services/reminders';

type Filter = 'all' | 'overdue' | 'dueSoon' | 'active';

export default function ServiceReminders() {
  const { t } = useTranslation();
  const { vehicle, hasVehicle } = useActiveVehicle();

  const [filter, setFilter] = useState<Filter>('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ServiceReminder | undefined>();
  const [pendingDelete, setPendingDelete] = useState<ServiceReminder | undefined>();
  const [pendingComplete, setPendingComplete] = useState<ServiceReminder | undefined>();

  const {
    data: reminders = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetRemindersQuery(vehicle ? { vehicleId: vehicle.id } : undefined, { skip: !vehicle });

  const [deleteReminder, { isLoading: isDeleting }] = useDeleteReminderMutation();
  const [completeReminder, { isLoading: isCompleting }] = useCompleteReminderMutation();

  const counts = useMemo(
    () => ({
      all: reminders.length,
      overdue: reminders.filter((reminder) => reminder.status === 'overdue').length,
      dueSoon: reminders.filter((reminder) => reminder.status === 'dueSoon').length,
      active: reminders.filter((reminder) => reminder.status === 'active').length,
    }),
    [reminders]
  );

  const visibleReminders = useMemo(
    () =>
      filter === 'all' ? reminders : reminders.filter((reminder) => reminder.status === filter),
    [reminders, filter]
  );

  const openCreate = () => {
    setEditingReminder(undefined);
    setIsSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteReminder(pendingDelete.id).unwrap();
      toast.success(t('reminders.deleteTitle'));
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.deleteFailed';
      toast.error(t('errors.deleteFailed'), t(message, { defaultValue: message }));
    } finally {
      setPendingDelete(undefined);
    }
  };

  const handleComplete = async () => {
    if (!pendingComplete) return;

    try {
      await completeReminder(pendingComplete.id).unwrap();
      toast.success(t('reminders.markDone'));
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.saveFailed';
      toast.error(t('errors.saveFailed'), t(message, { defaultValue: message }));
    } finally {
      setPendingComplete(undefined);
    }
  };

  const header = {
    titleTx: 'reminders.title',
    subtitleTx: 'reminders.subtitle',
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
      padded={false}
      header={header}
      overlay={
        <Fab
          aboveTabBar={false}
          onPress={openCreate}
          labelTx="reminders.addTitle"
          accessibilityLabel={t('reminders.addTitle')}
        />
      }
    >
      <FlatList
        data={visibleReminders}
        keyExtractor={(reminder) => reminder.id}
        renderItem={({ item }) => (
          <ReminderCard
            reminder={item}
            currentOdometer={vehicle?.odometer ?? 0}
            onEdit={() => {
              setEditingReminder(item);
              setIsSheetOpen(true);
            }}
            onDelete={() => setPendingDelete(item)}
            onComplete={() => setPendingComplete(item)}
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
          <View style={{ rowGap: SPACING.lg, paddingBottom: SPACING.md }}>
            <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
              <StatTile
                value={String(counts.overdue)}
                labelTx="reminders.stats.overdue"
                icon="alert-triangle"
                tone={counts.overdue > 0 ? 'danger' : 'success'}
              />
              <StatTile
                value={String(counts.dueSoon)}
                labelTx="reminders.stats.dueSoon"
                icon="clock"
                tone={counts.dueSoon > 0 ? 'warning' : 'text'}
              />
              <StatTile
                value={String(counts.active)}
                labelTx="reminders.stats.scheduled"
                icon="calendar"
              />
            </View>

            <SegmentedControl<Filter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', labelTx: 'maintenance.all', count: counts.all },
                { value: 'overdue', labelTx: 'status.overdue', count: counts.overdue },
                { value: 'dueSoon', labelTx: 'status.dueSoon', count: counts.dueSoon },
              ]}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <SkeletonCard count={3} />
          ) : (
            <EmptyState
              layout="inline"
              icon="bell"
              titleTx="reminders.emptyTitle"
              bodyTx="reminders.emptyBody"
              actionTx="reminders.addTitle"
              onAction={openCreate}
            />
          )
        }
      />

      {!!vehicle && (
        <ReminderSheet
          isVisible={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          vehicleId={vehicle.id}
          currentOdometer={vehicle.odometer}
          reminder={editingReminder}
        />
      )}

      <ConfirmDialog
        isVisible={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(undefined)}
        onConfirm={handleDelete}
        titleTx="reminders.deleteTitle"
        bodyTx="reminders.deleteBody"
        confirmTx="common.delete"
        tone="danger"
        icon="trash-2"
        loading={isDeleting}
      />

      <ConfirmDialog
        isVisible={Boolean(pendingComplete)}
        onClose={() => setPendingComplete(undefined)}
        onConfirm={handleComplete}
        titleTx="reminders.markDoneTitle"
        bodyTx="reminders.markDoneBody"
        confirmTx="common.done"
        icon="check-circle"
        loading={isCompleting}
      />
    </Screen>
  );
}
