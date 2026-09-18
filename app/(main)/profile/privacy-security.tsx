import React, { useState } from 'react';
import { Linking } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useSignOutMutation } from '@/apis/autopilotApi';
import { sessionEnded } from '@/redux/authReducer';
import { useAppDispatch } from '@/redux';
import { useBiometricLogin } from '@/hooks/useBiometricLogin';
import { ConfirmDialog, Screen } from '@/shared/components/layout';
import { ListRow, Switch, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { SettingsGroup } from '@/features/profile';
import IMPORTANT_VARS from '@/constants/ImportantVars';

export default function PrivacySecurity() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isBiometricSupported } = useBiometricLogin();
  const [signOut] = useSignOutMutation();

  const [biometricEnabled, setBiometricEnabled] = useState(isBiometricSupported);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [crashReportsEnabled, setCrashReportsEnabled] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  /**
   * Account deletion is irreversible and has to be carried out server-side, so
   * the app confirms, signs the user out and hands off to support until the
   * backend endpoint exists.
   */
  const handleDeleteAccount = async () => {
    setIsDeleteOpen(false);

    try {
      await signOut().unwrap();
    } finally {
      dispatch(sessionEnded());
      toast.info(t('privacy.deleteAccount'), t('help.emailUsBody'));
      router.replace('/(auth)/welcome');
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => toast.error(t('errors.unexpected')));
  };

  return (
    <Screen scroll gap="xl" header={{ titleTx: 'privacy.title' }}>
      <Text variant="body" color="textSecondary" tx="privacy.subtitle" />

      <SettingsGroup titleTx="privacy.security">
        <ListRow
          icon="unlock"
          titleTx="privacy.biometricLogin"
          subtitleTx={
            isBiometricSupported ? 'privacy.biometricLoginBody' : 'auth.biometricUnavailable'
          }
          right={
            <Switch
              value={biometricEnabled && isBiometricSupported}
              disabled={!isBiometricSupported}
              onValueChange={setBiometricEnabled}
            />
          }
        />
        <ListRow
          icon="key"
          iconTone="accentViolet"
          iconBackground="accentVioletSoft"
          titleTx="privacy.changePassword"
          subtitleTx="privacy.changePasswordBody"
          onPress={() => router.push('/(auth)/forgot-password')}
        />
      </SettingsGroup>

      <SettingsGroup titleTx="privacy.dataTitle">
        <ListRow
          icon="bar-chart-2"
          iconTone="accentBlue"
          iconBackground="accentBlueSoft"
          titleTx="privacy.analytics"
          subtitleTx="privacy.analyticsBody"
          right={<Switch value={analyticsEnabled} onValueChange={setAnalyticsEnabled} />}
        />
        <ListRow
          icon="alert-octagon"
          iconTone="accentAmber"
          iconBackground="accentAmberSoft"
          titleTx="privacy.crashReports"
          subtitleTx="privacy.crashReportsBody"
          right={<Switch value={crashReportsEnabled} onValueChange={setCrashReportsEnabled} />}
        />
        <ListRow
          icon="download"
          iconTone="accentTeal"
          iconBackground="accentTealSoft"
          titleTx="privacy.exportData"
          subtitleTx="privacy.exportDataBody"
          onPress={() => toast.info(t('common.comingSoon'))}
        />
      </SettingsGroup>

      <SettingsGroup titleTx="privacy.legalTitle">
        <ListRow
          icon="file-text"
          iconTone="textSecondary"
          iconBackground="surfaceAlt"
          titleTx="privacy.privacyPolicy"
          onPress={() => openLink(IMPORTANT_VARS.privacyPolicyUrl)}
        />
        <ListRow
          icon="file"
          iconTone="textSecondary"
          iconBackground="surfaceAlt"
          titleTx="privacy.termsOfService"
          onPress={() => openLink(IMPORTANT_VARS.termsUrl)}
        />
      </SettingsGroup>

      <SettingsGroup titleTx="privacy.dangerTitle">
        <ListRow
          icon="trash-2"
          destructive
          titleTx="privacy.deleteAccount"
          subtitleTx="privacy.deleteAccountBody"
          onPress={() => setIsDeleteOpen(true)}
        />
      </SettingsGroup>

      <ConfirmDialog
        isVisible={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        titleTx="privacy.deleteAccountTitle"
        bodyTx="privacy.deleteAccountConfirm"
        confirmTx="common.delete"
        tone="danger"
        icon="alert-triangle"
      />
    </Screen>
  );
}
