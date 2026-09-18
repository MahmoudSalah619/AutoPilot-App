import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import {
  useGetNotificationsQuery,
  useGetPreferencesQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useUpdatePreferencesMutation,
} from '@/apis/autopilotApi';
import { Screen } from '@/shared/components/layout';
import {
  Button,
  Card,
  Chip,
  Divider,
  EmptyState,
  ListRow,
  SegmentedControl,
  SkeletonCard,
  Switch,
  Text,
} from '@/shared/components/ui';
import { NotificationRow } from '@/features/notifications';
import { SettingsGroup } from '@/features/profile';

type Tab = 'inbox' | 'settings';

/** Lead-time options offered for "warn me this far ahead". */
const LEAD_DAYS = [1, 3, 7, 14, 30];

export default function Notifications() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('inbox');

  const { data: notifications = [], isLoading, isFetching, refetch } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  const { data: preferences } = useGetPreferencesQuery();
  const [updatePreferences] = useUpdatePreferencesMutation();

  /**
   * Per-category toggles are device-local until push delivery is wired up, so
   * they live in component state rather than pretending to persist.
   */
  const [pushEnabled, setPushEnabled] = useState(true);
  const [categories, setCategories] = useState({
    serviceReminders: true,
    documentExpiry: true,
    maintenanceDue: true,
    fuelInsights: false,
  });
  const [quietHours, setQuietHours] = useState(true);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const handleOpen = (id: string, href?: string) => {
    markRead(id);
    if (href) router.push(href as never);
  };

  const toggleCategory = (key: keyof typeof categories) =>
    setCategories((current) => ({ ...current, [key]: !current[key] }));

  return (
    <Screen
      scroll
      gap="xl"
      refreshing={isFetching}
      onRefresh={refetch}
      header={{
        titleTx: 'notifications.title',
        right:
          tab === 'inbox' && unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              tx="notifications.markAllRead"
              loading={isMarkingAll}
              onPress={() => markAllRead()}
            />
          ) : undefined,
      }}
    >
      <SegmentedControl<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'inbox', labelTx: 'notifications.title', count: unreadCount },
          { value: 'settings', labelTx: 'notifications.settings.categories' },
        ]}
      />

      {tab === 'inbox' ? (
        isLoading ? (
          <SkeletonCard count={4} />
        ) : notifications.length === 0 ? (
          <Card variant="outlined">
            <EmptyState
              layout="inline"
              icon="bell"
              titleTx="notifications.emptyTitle"
              bodyTx="notifications.emptyBody"
            />
          </Card>
        ) : (
          <Card padding="md">
            {notifications.map((notification, index) => (
              <View key={notification.id}>
                {index > 0 && <Divider inset={50} />}
                <NotificationRow
                  notification={notification}
                  onPress={() => handleOpen(notification.id, notification.href)}
                />
              </View>
            ))}
          </Card>
        )
      ) : (
        <>
          <SettingsGroup>
            <ListRow
              icon="bell"
              titleTx="notifications.settings.pushTitle"
              subtitleTx="notifications.settings.pushBody"
              right={<Switch value={pushEnabled} onValueChange={setPushEnabled} />}
            />
          </SettingsGroup>

          <SettingsGroup titleTx="notifications.settings.categories">
            <ListRow
              icon="clock"
              iconTone="accentViolet"
              iconBackground="accentVioletSoft"
              titleTx="notifications.settings.serviceReminders"
              subtitleTx="notifications.settings.serviceRemindersBody"
              right={
                <Switch
                  value={pushEnabled && categories.serviceReminders}
                  disabled={!pushEnabled}
                  onValueChange={() => toggleCategory('serviceReminders')}
                />
              }
            />
            <ListRow
              icon="file-text"
              iconTone="accentBlue"
              iconBackground="accentBlueSoft"
              titleTx="notifications.settings.documentExpiry"
              subtitleTx="notifications.settings.documentExpiryBody"
              right={
                <Switch
                  value={pushEnabled && categories.documentExpiry}
                  disabled={!pushEnabled}
                  onValueChange={() => toggleCategory('documentExpiry')}
                />
              }
            />
            <ListRow
              icon="tool"
              titleTx="notifications.settings.maintenanceDue"
              subtitleTx="notifications.settings.maintenanceDueBody"
              right={
                <Switch
                  value={pushEnabled && categories.maintenanceDue}
                  disabled={!pushEnabled}
                  onValueChange={() => toggleCategory('maintenanceDue')}
                />
              }
            />
            <ListRow
              icon="droplet"
              iconTone="accentTeal"
              iconBackground="accentTealSoft"
              titleTx="notifications.settings.fuelInsights"
              subtitleTx="notifications.settings.fuelInsightsBody"
              right={
                <Switch
                  value={pushEnabled && categories.fuelInsights}
                  disabled={!pushEnabled}
                  onValueChange={() => toggleCategory('fuelInsights')}
                />
              }
            />
          </SettingsGroup>

          <View style={{ rowGap: SPACING.md }}>
            <Text variant="h2" tx="notifications.settings.timing" />

            <Card style={{ rowGap: SPACING.md }}>
              <Text variant="label" color="textSecondary" tx="notifications.settings.leadTime" />

              <View
                style={{
                  columnGap: SPACING.sm,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  rowGap: SPACING.sm,
                }}
              >
                {LEAD_DAYS.map((days) => (
                  <Chip
                    key={days}
                    label={t('notifications.settings.leadTimeDays', { count: days })}
                    selected={preferences?.reminderLeadDays === days}
                    onPress={() => updatePreferences({ reminderLeadDays: days })}
                  />
                ))}
              </View>

              <Divider />

              <ListRow
                icon="moon"
                iconTone="accentViolet"
                iconBackground="accentVioletSoft"
                titleTx="notifications.settings.quietHours"
                subtitleTx="notifications.settings.quietHoursBody"
                right={<Switch value={quietHours} onValueChange={setQuietHours} />}
              />
            </Card>
          </View>
        </>
      )}
    </Screen>
  );
}
