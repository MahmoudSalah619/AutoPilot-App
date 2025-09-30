import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Switch, Alert } from 'react-native';
import { Text, Button } from '@/shared/components/ui';
import { CardWrapper } from '@/shared/components/ui';
import { COLORS } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

export default function PrivacySecurity() {
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);
  const [thirdPartySharing, setThirdPartySharing] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'You will be redirected to change your password',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => console.log('Account deletion requested')
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'We will send your data export to your email address.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text size={24} weight={700} style={styles.title} autoTranslate={false}>
          Privacy & Security
        </Text>
        <Text size={14} color="grey70" style={styles.subtitle} autoTranslate={false}>
          Manage your privacy settings and account security
        </Text>
      </View>

      {/* Security Card */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="shield" size={20} color={COLORS.light.primary} />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Account Security
          </Text>
        </View>

        <View style={styles.securityOption}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIcon, { backgroundColor: `${COLORS.light.primary}15` }]}>
              <Feather name="lock" size={18} color={COLORS.light.primary} />
            </View>
            <View style={styles.optionInfo}>
              <Text size={16} weight={500} autoTranslate={false}>
                Biometric Authentication
              </Text>
              <Text size={12} color="grey70" autoTranslate={false}>
                Use fingerprint or face ID to access the app
              </Text>
            </View>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={setBiometricEnabled}
            trackColor={{ false: COLORS.light.greyE5, true: `${COLORS.light.primary}40` }}
            thumbColor={biometricEnabled ? COLORS.light.primary : COLORS.light.grey70}
          />
        </View>

        <View style={styles.actionItem}>
          <View style={styles.actionLeft}>
            <View style={[styles.optionIcon, { backgroundColor: '#4ECDC415' }]}>
              <Feather name="key" size={18} color="#4ECDC4" />
            </View>
            <View style={styles.optionInfo}>
              <Text size={16} weight={500} autoTranslate={false}>
                Change Password
              </Text>
              <Text size={12} color="grey70" autoTranslate={false}>
                Update your account password
              </Text>
            </View>
          </View>
          <Button
            title="Change"
            variant="outlined"
            onPress={handleChangePassword}
            buttonStyle={styles.smallButton}
          />
        </View>
      </CardWrapper>

      {/* Privacy Settings */}
      {/* <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="eye-off" size={20} color="#FF8C94" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Privacy Settings
          </Text>
        </View>

        <View style={styles.securityOption}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIcon, { backgroundColor: '#FF8C9415' }]}>
              <Feather name="map-pin" size={18} color="#FF8C94" />
            </View>
            <View style={styles.optionInfo}>
              <Text size={16} weight={500} autoTranslate={false}>
                Location Sharing
              </Text>
              <Text size={12} color="grey70" autoTranslate={false}>
                Share location for trip planning and services
              </Text>
            </View>
          </View>
          <Switch
            value={locationSharing}
            onValueChange={setLocationSharing}
            trackColor={{ false: COLORS.light.greyE5, true: '#FF8C9440' }}
            thumbColor={locationSharing ? '#FF8C94' : COLORS.light.grey70}
          />
        </View>

        <View style={styles.securityOption}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIcon, { backgroundColor: '#96CEB415' }]}>
              <Feather name="bar-chart" size={18} color="#96CEB4" />
            </View>
            <View style={styles.optionInfo}>
              <Text size={16} weight={500} autoTranslate={false}>
                Usage Analytics
              </Text>
              <Text size={12} color="grey70" autoTranslate={false}>
                Help improve the app by sharing usage data
              </Text>
            </View>
          </View>
          <Switch
            value={dataCollection}
            onValueChange={setDataCollection}
            trackColor={{ false: COLORS.light.greyE5, true: '#96CEB440' }}
            thumbColor={dataCollection ? '#96CEB4' : COLORS.light.grey70}
          />
        </View>

        <View style={styles.securityOption}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIcon, { backgroundColor: '#FFD93D15' }]}>
              <Feather name="share-2" size={18} color="#FFD93D" />
            </View>
            <View style={styles.optionInfo}>
              <Text size={16} weight={500} autoTranslate={false}>
                Third-Party Sharing
              </Text>
              <Text size={12} color="grey70" autoTranslate={false}>
                Share data with partner services
              </Text>
            </View>
          </View>
          <Switch
            value={thirdPartySharing}
            onValueChange={setThirdPartySharing}
            trackColor={{ false: COLORS.light.greyE5, true: '#FFD93D40' }}
            thumbColor={thirdPartySharing ? '#FFD93D' : COLORS.light.grey70}
          />
        </View>
      </CardWrapper> */}

      {/* Data Management */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="database" size={20} color="#A8E6CF" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Data Management
          </Text>
        </View>

        {/* <View style={styles.securityOption}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIcon, { backgroundColor: '#A8E6CF15' }]}>
              <Feather name="cloud" size={18} color="#A8E6CF" />
            </View>
            <View style={styles.optionInfo}>
              <Text size={16} weight={500} autoTranslate={false}>
                Auto Backup
              </Text>
              <Text size={12} color="grey70" autoTranslate={false}>
                Automatically backup your data to cloud
              </Text>
            </View>
          </View>
          <Switch
            value={autoBackup}
            onValueChange={setAutoBackup}
            trackColor={{ false: COLORS.light.greyE5, true: '#A8E6CF40' }}
            thumbColor={autoBackup ? '#A8E6CF' : COLORS.light.grey70}
          />
        </View> */}

        <View style={styles.actionItem}>
          <View style={styles.actionLeft}>
            <View style={[styles.optionIcon, { backgroundColor: '#4ECDC415' }]}>
              <Feather name="download" size={18} color="#4ECDC4" />
            </View>
            <View style={styles.optionInfo}>
              <Text size={16} weight={500} autoTranslate={false}>
                Export My Data
              </Text>
              <Text size={12} color="grey70" autoTranslate={false}>
                Download a copy of your data
              </Text>
            </View>
          </View>
          <Button
            title="Export"
            variant="outlined"
            onPress={handleExportData}
            buttonStyle={styles.smallButton}
          />
        </View>
      </CardWrapper>

      {/* Danger Zone */}
      <CardWrapper customStyles={StyleSheet.flatten([styles.card, styles.dangerCard])}>
        <View style={styles.cardHeader}>
          <Feather name="alert-triangle" size={20} color="#FF6B6B" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Danger Zone
          </Text>
        </View>

        <Text size={14} color="grey70" style={styles.dangerText} autoTranslate={false}>
          These actions are permanent and cannot be undone
        </Text>

        <Button
          title="Delete Account"
          variant="outlined"
          onPress={handleDeleteAccount}
          color="#FF6B6B"
          borderColor="#FF6B6B"
          isFullWidth
          buttonStyle={styles.dangerButton}
        />
      </CardWrapper>

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
  dangerCard: {
    borderWidth: 1,
    borderColor: '#FF6B6B20',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
  },
  dangerText: {
    marginBottom: 16,
    lineHeight: 20,
  },
  dangerButton: {
    borderColor: '#FF6B6B',
  },
  bottomSpacing: {
    height: 32,
  },
});