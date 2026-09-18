import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { RADIUS } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { useChangeLanguage } from '@/hooks/useChangeLanguage';
import type { AppLanguage } from '@/locale';
import { ConfirmDialog, Screen } from '@/shared/components/layout';
import { Card, ListRow, Text } from '@/shared/components/ui';

const LANGUAGES: { value: AppLanguage; titleTx: string }[] = [
  { value: 'en', titleTx: 'language.english' },
  { value: 'ar', titleTx: 'language.arabic' },
];

export default function Language() {
  const { colors } = useTheme();
  const { language, changeLanguage, isRestartRequired, dismissRestart, restart } =
    useChangeLanguage();

  return (
    <Screen scroll gap="xl" header={{ titleTx: 'language.title' }}>
      <Text variant="body" color="textSecondary" tx="language.subtitle" />

      <Card padding="md">
        {LANGUAGES.map((option) => (
          <ListRow
            key={option.value}
            icon="globe"
            titleTx={option.titleTx}
            subtitleTx={option.value === 'ar' ? 'language.rtlNotice' : undefined}
            onPress={() => changeLanguage(option.value)}
            showChevron={false}
            right={
              language === option.value ? (
                <Feather name="check-circle" size={20} color={colors.primary} />
              ) : (
                <View
                  style={{
                    borderColor: colors.borderStrong,
                    borderRadius: RADIUS.pill,
                    borderWidth: 1.5,
                    height: 20,
                    width: 20,
                  }}
                />
              )
            }
          />
        ))}
      </Card>

      {/* Switching writing direction only takes effect after a reload. */}
      <ConfirmDialog
        isVisible={isRestartRequired}
        onClose={dismissRestart}
        onConfirm={restart}
        titleTx="language.title"
        bodyTx="language.rtlNotice"
        confirmTx="common.confirm"
        cancelTx="common.cancel"
        icon="refresh-cw"
      />
    </Screen>
  );
}
