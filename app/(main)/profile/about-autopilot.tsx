import React from 'react';
import { Linking, Share, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import IMPORTANT_VARS from '@/constants/ImportantVars';
import { useTheme } from '@/theme';
import { Screen } from '@/shared/components/layout';
import { Card, ListRow, Logo, SectionHeader, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { SettingsGroup } from '@/features/profile';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

const FEATURES: { icon: FeatherIconName; titleTx: string }[] = [
  { icon: 'tool', titleTx: 'services.reminders' },
  { icon: 'droplet', titleTx: 'services.fuel' },
  { icon: 'file-text', titleTx: 'services.documents' },
  { icon: 'alert-triangle', titleTx: 'services.errorsGuide' },
  { icon: 'wind', titleTx: 'services.climate' },
  { icon: 'map', titleTx: 'services.trips' },
];

export default function AboutAutoPilot() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => toast.error(t('errors.unexpected')));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${t('app.name')} — ${t('app.tagline')} ${IMPORTANT_VARS.websiteUrl}`,
      });
    } catch {
      toast.error(t('errors.unexpected'));
    }
  };

  return (
    <Screen scroll gap="xl" header={{ titleTx: 'about.title' }}>
      <Card padding="xl" style={{ alignItems: 'center', rowGap: SPACING.md }}>
        <Logo size={72} />

        <View style={{ alignItems: 'center', rowGap: SPACING.xxs }}>
          <Text variant="h1" tx="app.name" />
          <Text variant="bodySm" color="textSecondary" tx="app.tagline" />
          <Text variant="caption" color="textMuted">
            {t('about.version', { version: IMPORTANT_VARS.version })}
          </Text>
        </View>
      </Card>

      <View style={{ rowGap: SPACING.md }}>
        <SectionHeader titleTx="about.missionTitle" icon="target" />

        <Card variant="flat">
          <Text variant="body" color="textSecondary" tx="about.missionBody" />
        </Card>
      </View>

      <View style={{ rowGap: SPACING.md }}>
        <SectionHeader titleTx="about.featuresTitle" icon="grid" />

        <Card>
          <View
            style={{
              columnGap: SPACING.md,
              flexDirection: 'row',
              flexWrap: 'wrap',
              rowGap: SPACING.md,
            }}
          >
            {FEATURES.map((feature) => (
              <View
                key={feature.titleTx}
                style={{
                  alignItems: 'center',
                  columnGap: SPACING.sm,
                  flexBasis: '45%',
                  flexDirection: 'row',
                  flexGrow: 1,
                }}
              >
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: colors.primarySoft,
                    borderRadius: RADIUS.sm,
                    height: 28,
                    justifyContent: 'center',
                    width: 28,
                  }}
                >
                  <Feather name={feature.icon} size={14} color={colors.primary} />
                </View>

                <Text variant="bodySm" tx={feature.titleTx} numberOfLines={1} style={{ flex: 1 }} />
              </View>
            ))}
          </View>
        </Card>
      </View>

      <SettingsGroup titleTx="about.followTitle">
        <ListRow
          icon="globe"
          iconTone="accentBlue"
          iconBackground="accentBlueSoft"
          titleTx="about.website"
          onPress={() => openLink(IMPORTANT_VARS.websiteUrl)}
        />
        <ListRow
          icon="share-2"
          iconTone="accentGreen"
          iconBackground="accentGreenSoft"
          titleTx="about.shareApp"
          onPress={handleShare}
        />
      </SettingsGroup>

      <SettingsGroup titleTx="about.legalTitle">
        <ListRow
          icon="shield"
          iconTone="textSecondary"
          iconBackground="surfaceAlt"
          titleTx="about.privacyPolicy"
          onPress={() => openLink(IMPORTANT_VARS.privacyPolicyUrl)}
        />
        <ListRow
          icon="file-text"
          iconTone="textSecondary"
          iconBackground="surfaceAlt"
          titleTx="about.termsOfService"
          onPress={() => openLink(IMPORTANT_VARS.termsUrl)}
        />
      </SettingsGroup>

      <View style={{ rowGap: SPACING.xs }}>
        <Text variant="caption" color="textMuted" align="center" tx="about.creditsBody" />
        <Text variant="caption" color="textMuted" align="center">
          {t('about.copyright', { year: new Date().getFullYear() })}
        </Text>
      </View>
    </Screen>
  );
}
