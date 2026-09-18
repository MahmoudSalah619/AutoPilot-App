import React, { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useGetProfileQuery, useSignOutMutation } from '@/apis/autopilotApi';
import { sessionEnded } from '@/redux/authReducer';
import { useAppDispatch } from '@/redux';
import { useTheme } from '@/theme';
import { ConfirmDialog, Screen } from '@/shared/components/layout';
import { ListRow } from '@/shared/components/ui';
import { ProfileHeader, SettingsGroup } from '@/features/profile';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { preference } = useTheme();

  const { data: profile } = useGetProfileQuery();
  const [signOut, { isLoading: isSigningOut }] = useSignOutMutation();
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut().unwrap();
    } finally {
      // Local state is cleared either way — a failed network call must not
      // leave the user stuck in a session they asked to end.
      dispatch(sessionEnded());
      setIsSignOutOpen(false);
      router.replace('/(auth)/welcome');
    }
  };

  return (
    <Screen
      scroll
      hasTabBar
      gap="xl"
      header={{ titleTx: 'profile.title', variant: 'large', showBack: false }}
    >
      <ProfileHeader
        profile={profile}
        onEditPress={() => router.push('/(main)/profile/personal-information')}
      />

      <SettingsGroup titleTx="profile.sections.account">
        <ListRow
          icon="user"
          titleTx="profile.personalInformation"
          subtitleTx="profile.personalInformationSubtitle"
          onPress={() => router.push('/(main)/profile/personal-information')}
        />
        <ListRow
          icon="truck"
          iconTone="accentBlue"
          iconBackground="accentBlueSoft"
          titleTx="profile.vehicleInformation"
          subtitleTx="profile.vehicleInformationSubtitle"
          onPress={() => router.push('/(main)/profile/vehicle-information')}
        />
        <ListRow
          icon="bell"
          iconTone="accentViolet"
          iconBackground="accentVioletSoft"
          titleTx="profile.notifications"
          subtitleTx="profile.notificationsSubtitle"
          onPress={() => router.push('/(main)/profile/notifications')}
        />
      </SettingsGroup>

      <SettingsGroup titleTx="profile.sections.preferences">
        <ListRow
          icon="moon"
          iconTone="accentViolet"
          iconBackground="accentVioletSoft"
          titleTx="profile.appearance"
          subtitle={t(`appearance.${preference}`)}
          onPress={() => router.push('/(main)/profile/appearance')}
        />
        <ListRow
          icon="globe"
          iconTone="accentTeal"
          iconBackground="accentTealSoft"
          titleTx="profile.language"
          subtitle={t(i18n.language === 'ar' ? 'language.arabic' : 'language.english')}
          onPress={() => router.push('/(main)/profile/language')}
        />
        <ListRow
          icon="sliders"
          iconTone="accentGreen"
          iconBackground="accentGreenSoft"
          titleTx="profile.unitsAndCurrency"
          subtitleTx="profile.unitsAndCurrencySubtitle"
          onPress={() => router.push('/(main)/profile/units')}
        />
        <ListRow
          icon="shield"
          iconTone="accentRose"
          iconBackground="accentRoseSoft"
          titleTx="profile.privacy"
          subtitleTx="profile.privacySubtitle"
          onPress={() => router.push('/(main)/profile/privacy-security')}
        />
      </SettingsGroup>

      <SettingsGroup titleTx="profile.sections.support">
        <ListRow
          icon="compass"
          iconTone="primary"
          iconBackground="primarySoft"
          titleTx="howItWorks.title"
          subtitleTx="howItWorks.subtitle"
          onPress={() => router.push('/(main)/profile/how-it-works')}
        />
        <ListRow
          icon="help-circle"
          iconTone="accentAmber"
          iconBackground="accentAmberSoft"
          titleTx="profile.help"
          subtitleTx="profile.helpSubtitle"
          onPress={() => router.push('/(main)/profile/help-support')}
        />
        <ListRow
          icon="info"
          iconTone="accentBlue"
          iconBackground="accentBlueSoft"
          titleTx="profile.about"
          subtitleTx="profile.aboutSubtitle"
          onPress={() => router.push('/(main)/profile/about-autopilot')}
        />
      </SettingsGroup>

      <SettingsGroup>
        <ListRow
          icon="log-out"
          destructive
          titleTx="auth.signOut"
          showChevron={false}
          onPress={() => setIsSignOutOpen(true)}
        />
      </SettingsGroup>

      <ConfirmDialog
        isVisible={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        onConfirm={handleSignOut}
        titleTx="profile.signOutTitle"
        bodyTx="profile.signOutBody"
        confirmTx="auth.signOut"
        tone="danger"
        icon="log-out"
        loading={isSigningOut}
      />
    </Screen>
  );
}
