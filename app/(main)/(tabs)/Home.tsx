import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { SPACING } from '@/constants/Layout';
import {
  useGetFuelEntriesQuery,
  useGetProfileQuery,
  useGetRemindersQuery,
} from '@/apis/autopilotApi';
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
import { useOdometerNudge, UpdateOdometerSheet, VehicleSummaryCard } from '@/features/vehicle';
import { NotificationBell } from '@/features/notifications';
import { useTour } from '@/features/onboarding';

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

  const { activeTour, isReady, startFirstRunTour, consumeRequestedTour } = useTour();

  const { items: attentionItems, isLoading: isAttentionLoading } = useAttentionItems(vehicle?.id);

  const { data: fuel } = useGetFuelEntriesQuery(vehicle ? { vehicleId: vehicle.id } : undefined, {
    skip: !vehicle,
  });

  const { data: reminders = [] } = useGetRemindersQuery(
    vehicle ? { vehicleId: vehicle.id } : undefined,
    { skip: !vehicle }
  );

  /**
   * The odometer prompt is suppressed while the tour runs so a first-time user
   * never gets two overlays stacked on top of each other.
   */
  const { needsAttention, shouldPrompt, dismissPrompt } = useOdometerNudge({
    vehicle,
    isSuppressed: Boolean(activeTour) || isOdometerSheetOpen,
  });

  /**
   * A brand-new account gets the tour once; the walkthrough screen can also
   * queue a replay, which is picked up here because the tour's targets only
   * exist on this screen.
   */
  useEffect(() => {
    if (!isReady || !hasVehicle) return;
    if (consumeRequestedTour('home')) return;

    startFirstRunTour('home');
  }, [isReady, hasVehicle, consumeRequestedTour, startFirstRunTour]);

  // Opening the sheet counts as having asked, so it does not reappear today.
  useEffect(() => {
    if (!shouldPrompt) return;

    setIsOdometerSheetOpen(true);
    dismissPrompt();
  }, [shouldPrompt, dismissPrompt]);

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        key: 'odometer',
        icon: 'edit-3',
        labelTx: 'home.updateOdometer',
        tone: 'primary',
        onPress: () => setIsOdometerSheetOpen(true),
      },
      {
        key: 'fuel',
        icon: 'droplet',
        labelTx: 'home.logFuel',
        tone: 'accentTeal',
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
          reminders={reminders}
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
          /* A stale reading means the sheet opened on its own, so it explains
             why rather than just presenting an empty field. */
          isPrompted={needsAttention}
        />
      )}
    </Screen>
  );
}
