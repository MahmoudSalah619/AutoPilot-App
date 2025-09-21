import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Switch } from 'react-native';
import { Text, Button } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import { COLORS } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: string;
  color: string;
}

export default function NotificationSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'maintenance_reminders',
      title: 'Maintenance Reminders',
      description: 'Get notified about upcoming maintenance schedules',
      enabled: true,
      icon: 'tool',
      color: COLORS.light.primary,
    },
    {
      id: 'service_alerts',
      title: 'Service Alerts',
      description: 'Receive alerts about service appointments and updates',
      enabled: true,
      icon: 'bell',
      color: '#4ECDC4',
    },
    {
      id: 'fuel_reminders',
      title: 'Fuel Efficiency Alerts',
      description: 'Notifications about fuel consumption and efficiency tips',
      enabled: false,
      icon: 'zap',
      color: '#FFD93D',
    },
    {
      id: 'document_expiry',
      title: 'Document Expiry',
      description: 'Alerts when your vehicle documents are about to expire',
      enabled: true,
      icon: 'file-text',
      color: '#FF8C94',
    },
    {
      id: 'trip_updates',
      title: 'Trip Updates',
      description: 'Get updates about your planned trips and routes',
      enabled: false,
      icon: 'map',
      color: '#96CEB4',
    },
    {
      id: 'promotional',
      title: 'Promotional Offers',
      description: 'Receive notifications about discounts and special offers',
      enabled: false,
      icon: 'gift',
      color: '#A8E6CF',
    },
  ]);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? {...setting, enabled: !setting.enabled} : setting
    ));
  };

  const handleSaveSettings = () => {
    console.log('Saving notification settings:', { settings, pushEnabled, emailEnabled });
    // Save settings logic here
  };

  const enabledCount = settings.filter(s => s.enabled).length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text size={24} weight={700} style={styles.title} autoTranslate={false}>
          Notification Settings
        </Text>
        <Text size={14} color="grey70" style={styles.subtitle} autoTranslate={false}>
          Manage how and when you receive notifications
        </Text>
      </View>

      {/* Overview Card */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.overviewContent}>
          <View style={styles.overviewIcon}>
            <Feather name="bell" size={24} color={COLORS.light.primary} />
          </View>
          <View style={styles.overviewText}>
            <Text size={18} weight={600} autoTranslate={false}>
              {enabledCount} of {settings.length} notifications enabled
            </Text>
            <Text size={14} color="grey70" autoTranslate={false}>
              Stay informed about your vehicle's needs
            </Text>
          </View>
        </View>
      </CardWrapper>

      {/* Delivery Methods */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="send" size={20} color="#4ECDC4" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Delivery Methods
          </Text>
        </View>

        <View style={styles.deliveryMethod}>
          <View style={styles.methodInfo}>
            <Text size={16} weight={500} autoTranslate={false}>Push Notifications</Text>
            <Text size={14} color="grey70" autoTranslate={false}>
              Receive notifications on your device
            </Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: COLORS.light.greyE5, true: `${COLORS.light.primary}40` }}
            thumbColor={pushEnabled ? COLORS.light.primary : COLORS.light.grey70}
          />
        </View>

        <View style={styles.deliveryMethod}>
          <View style={styles.methodInfo}>
            <Text size={16} weight={500} autoTranslate={false}>Email Notifications</Text>
            <Text size={14} color="grey70" autoTranslate={false}>
              Get updates via email
            </Text>
          </View>
          <Switch
            value={emailEnabled}
            onValueChange={setEmailEnabled}
            trackColor={{ false: COLORS.light.greyE5, true: `${COLORS.light.primary}40` }}
            thumbColor={emailEnabled ? COLORS.light.primary : COLORS.light.grey70}
          />
        </View>
      </CardWrapper>

      {/* Notification Categories */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="list" size={20} color="#FF8C94" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Notification Categories
          </Text>
        </View>

        <View style={styles.categoriesList}>
          {settings.map((setting) => (
            <View key={setting.id} style={styles.notificationItem}>
              <View style={styles.notificationLeft}>
                <View style={[styles.notificationIcon, { backgroundColor: `${setting.color}15` }]}>
                  <Feather name={setting.icon as any} size={18} color={setting.color} />
                </View>
                <View style={styles.notificationInfo}>
                  <Text size={16} weight={500} autoTranslate={false}>
                    {setting.title}
                  </Text>
                  <Text size={12} color="grey70" style={styles.notificationDescription} autoTranslate={false}>
                    {setting.description}
                  </Text>
                </View>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: COLORS.light.greyE5, true: `${setting.color}40` }}
                thumbColor={setting.enabled ? setting.color : COLORS.light.grey70}
              />
            </View>
          ))}
        </View>
      </CardWrapper>

      {/* Quiet Hours */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="moon" size={20} color="#96CEB4" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Quiet Hours
          </Text>
        </View>

        <Text size={14} color="grey70" style={styles.quietHoursText} autoTranslate={false}>
          Set times when you don't want to receive non-urgent notifications
        </Text>

        <View style={styles.timeRange}>
          <View style={styles.timeInput}>
            <Text size={14} weight={500} autoTranslate={false}>From</Text>
            <Text size={16} color="primary" autoTranslate={false}>10:00 PM</Text>
          </View>
          <Text size={14} color="grey70" autoTranslate={false}>to</Text>
          <View style={styles.timeInput}>
            <Text size={14} weight={500} autoTranslate={false}>Until</Text>
            <Text size={16} color="primary" autoTranslate={false}>8:00 AM</Text>
          </View>
        </View>
      </CardWrapper>

      {/* Save Button */}
      <Button
        title="Save Settings"
        variant="filled"
        onPress={handleSaveSettings}
        isFullWidth
        buttonStyle={styles.saveButton}
      />

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 20,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
  },
  overviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.light.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  overviewText: {
    flex: 1,
  },
  deliveryMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.greyE5,
  },
  methodInfo: {
    flex: 1,
  },
  categoriesList: {
    gap: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationDescription: {
    lineHeight: 16,
    marginTop: 2,
  },
  quietHoursText: {
    marginBottom: 16,
    lineHeight: 20,
  },
  timeRange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  timeInput: {
    alignItems: 'center',
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});