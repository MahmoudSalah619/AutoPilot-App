import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { SPACING } from '@/constants/Layout';
import { useGetFuelEntriesQuery, useGetProfileQuery } from '@/apis/autopilotApi';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { Screen } from '@/shared/components/layout';
import {
  Card,
  Divider,
  EmptyState,
  SectionHeader,
  SkeletonCard,
  Text,
} from '@/shared/components/ui';
import {
  AttentionRow,
  FuelSnapshot,
  QuickActions,
  useAttentionItems,
  type QuickAction,
} from '@/features/home';
import { UpdateOdometerSheet, VehicleSummaryCard } from '@/features/vehicle';
import { NotificationBell } from '@/features/notifications';

/** Time-of-day greeting key. */
function greetingKey(): string {
  const hour = dayjs().hour();

  if (hour < 12) return 'home.greetingMorning';
  if (hour < 18) return 'home.greetingAfternoon';

  return 'home.greetingEvening';
}

export default function Home() {
  const { t } = useTranslation();
  const { vehicle, vehicles, hasVehicle, isLoading, isFetching, refetch } = useActiveVehicle();
  const { data: profile } = useGetProfileQuery();

  const [isOdometerSheetOpen, setIsOdometerSheetOpen] = useState(false);

  const { items: attentionItems, isLoading: isAttentionLoading } = useAttentionItems(vehicle?.id);

  const { data: fuel } = useGetFuelEntriesQuery(vehicle ? { vehicleId: vehicle.id } : undefined, {
    skip: !vehicle,
  });

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        key: 'fuel',
        icon: 'droplet',
        labelTx: 'home.logFuel',
        tone: 'primary',
        onPress: () => router.push('/(main)/services/gas-consumption'),
      },
      {
        key: 'service',
        icon: 'tool',
        labelTx: 'home.logService',
        tone: 'accentBlue',
        onPress: () => router.push('/(main)/(tabs)/Maintenance'),
      },
      {
        key: 'reminder',
        icon: 'bell',
        labelTx: 'home.addReminder',
        tone: 'accentViolet',
        onPress: () => router.push('/(main)/services/service-reminders'),
      },
      {
        key: 'odometer',
        icon: 'edit-3',
        labelTx: 'home.updateOdometer',
        tone: 'accentTeal',
        onPress: () => setIsOdometerSheetOpen(true),
      },
    ],
    []
  );

  const header = {
    showBack: false,
    right: <NotificationBell />,
  };

  if (isLoading) {
    return (
      <Screen scroll hasTabBar header={header}>
        <SkeletonCard count={3} />
      </Screen>
    );
  }

  if (!hasVehicle) {
    return (
      <Screen hasTabBar header={header}>
        <EmptyState
          icon="truck"
          titleTx="home.noVehicleTitle"
          bodyTx="home.noVehicleBody"
          actionTx="home.addVehicle"
          onAction={() => router.push('/(main)/vehicle/add')}
        />
      </Screen>
    );
  }

  const hasFuelData = (fuel?.statistics.entryCount ?? 0) >= 2;

  return (
    <Screen scroll hasTabBar gap="xxl" header={header} refreshing={isFetching} onRefresh={refetch}>
      <View style={{ rowGap: SPACING.xxs }}>
        <Text variant="bodySm" color="textSecondary" tx={greetingKey()} />
        <Text variant="display">{profile?.firstName ?? t('app.name')}</Text>
      </View>

      {!!vehicle && (
        <VehicleSummaryCard
          vehicle={vehicle}
          onUpdateOdometer={() => setIsOdometerSheetOpen(true)}
          onSwitchVehicle={
            vehicles.length > 1
              ? () => router.push('/(main)/profile/vehicle-information')
              : undefined
          }
          onPress={() => router.push(`/(main)/vehicle/${vehicle.id}`)}
        />
      )}

      <View style={{ rowGap: SPACING.md }}>
        <SectionHeader titleTx="home.quickActions" />
        <QuickActions actions={quickActions} />
      </View>

      <View style={{ rowGap: SPACING.md }}>
        <SectionHeader
          titleTx="home.attentionTitle"
          subtitleTx={attentionItems.length > 0 ? 'home.attentionSubtitle' : undefined}
          icon="alert-circle"
        />

        {isAttentionLoading ? (
          <SkeletonCard count={2} />
        ) : attentionItems.length === 0 ? (
          <Card variant="outlined">
            <EmptyState
              layout="inline"
              icon="check-circle"
              titleTx="home.allClearTitle"
              bodyTx="home.allClearBody"
            />
          </Card>
        ) : (
          <Card padding="md">
            {attentionItems.slice(0, 4).map((item, index) => (
              <View key={`${item.kind}-${item.id}`}>
                {index > 0 && <Divider inset={50} />}
                <AttentionRow item={item} onPress={() => router.push(item.href as never)} />
              </View>
            ))}
          </Card>
        )}
      </View>

      {hasFuelData && !!fuel && (
        <FuelSnapshot
          statistics={fuel.statistics}
          onPress={() => router.push('/(main)/services/gas-consumption')}
        />
      )}

      {!!vehicle && (
        <UpdateOdometerSheet
          isVisible={isOdometerSheetOpen}
          onClose={() => setIsOdometerSheetOpen(false)}
          vehicle={vehicle}
        />
      )}
    </Screen>
  );
}
