import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { SPACING } from '@/constants/Layout';
import { useGetMaintenanceQuery } from '@/apis/autopilotApi';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import type { MaintenanceRecord } from '@/@types/models';
import { Screen } from '@/shared/components/layout';
import { EmptyState, Fab, SegmentedControl, SkeletonCard, StatTile } from '@/shared/components/ui';
import { MaintenanceCard, MaintenanceSheet } from '@/features/maintenance';
import { formatCurrency } from '@/utils/format';

type Tab = 'upcoming' | 'history' | 'all';

export default function Maintenance() {
  const { t } = useTranslation();
  const { vehicle, hasVehicle } = useActiveVehicle();
  const [tab, setTab] = useState<Tab>('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | undefined>();

  const {
    data: records = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetMaintenanceQuery(vehicle ? { vehicleId: vehicle.id } : undefined, {
    skip: !vehicle,
  });

  const { upcoming, history } = useMemo(() => {
    const isDone = (record: MaintenanceRecord) => record.status === 'completed';

    return {
      upcoming: records.filter((record) => !isDone(record)),
      history: records.filter(isDone),
    };
  }, [records]);

  const spentThisYear = useMemo(() => {
    const startOfYear = dayjs().startOf('year');

    return history
      .filter((record) => dayjs(record.date).isAfter(startOfYear))
      .reduce((sum, record) => sum + (record.cost ?? 0), 0);
  }, [history]);

  const dueNowCount = useMemo(
    () =>
      records.filter((record) => record.status === 'overdue' || record.status === 'dueSoon').length,
    [records]
  );

  const visibleRecords = tab === 'upcoming' ? upcoming : tab === 'history' ? history : records;

  const openCreate = () => {
    setEditingRecord(undefined);
    setIsSheetOpen(true);
  };

  const openEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setIsSheetOpen(true);
  };

  const header = {
    titleTx: 'maintenance.title',
    subtitleTx: 'maintenance.subtitle',
    variant: 'large' as const,
    showBack: false,
  };

  if (!hasVehicle) {
    return (
      <Screen hasTabBar header={header}>
        <EmptyState icon="truck" titleTx="vehicle.emptyTitle" bodyTx="vehicle.emptyBody" />
      </Screen>
    );
  }

  const emptyTitleTx =
    tab === 'upcoming'
      ? 'maintenance.emptyUpcomingTitle'
      : tab === 'history'
        ? 'maintenance.emptyHistoryTitle'
        : 'maintenance.emptyTitle';

  const emptyBodyTx =
    tab === 'upcoming'
      ? 'maintenance.emptyUpcomingBody'
      : tab === 'history'
        ? 'maintenance.emptyHistoryBody'
        : 'maintenance.emptyBody';

  return (
    <Screen
      hasTabBar
      padded={false}
      header={header}
      overlay={
        <Fab
          onPress={openCreate}
          labelTx="maintenance.logService"
          accessibilityLabel={t('maintenance.logService')}
        />
      }
    >
      <FlatList
        data={visibleRecords}
        keyExtractor={(record) => record.id}
        renderItem={({ item }) => <MaintenanceCard record={item} onPress={() => openEdit(item)} />}
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
                value={String(records.length)}
                labelTx="maintenance.stats.totalServices"
                icon="tool"
              />
              <StatTile
                value={formatCurrency(spentThisYear, 'EGP')}
                labelTx="maintenance.stats.spentThisYear"
                icon="credit-card"
                tone="primary"
              />
              <StatTile
                value={String(dueNowCount)}
                labelTx="maintenance.stats.dueNow"
                icon="alert-circle"
                tone={dueNowCount > 0 ? 'danger' : 'success'}
              />
            </View>

            <SegmentedControl<Tab>
              value={tab}
              onChange={setTab}
              options={[
                { value: 'all', labelTx: 'maintenance.all', count: records.length },
                { value: 'upcoming', labelTx: 'maintenance.upcoming', count: upcoming.length },
                { value: 'history', labelTx: 'maintenance.history', count: history.length },
              ]}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <SkeletonCard count={4} />
          ) : (
            <EmptyState
              layout="inline"
              icon="tool"
              titleTx={emptyTitleTx}
              bodyTx={emptyBodyTx}
              actionTx="maintenance.logService"
              onAction={openCreate}
            />
          )
        }
      />

      {!!vehicle && (
        <MaintenanceSheet
          isVisible={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          vehicleId={vehicle.id}
          currentOdometer={vehicle.odometer}
          record={editingRecord}
        />
      )}
    </Screen>
  );
}
