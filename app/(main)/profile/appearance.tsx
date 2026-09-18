import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme, type ThemePreference } from '@/theme';
import { Screen } from '@/shared/components/layout';
import { Card, ListRow, SectionHeader, Text } from '@/shared/components/ui';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

const OPTIONS: {
  value: ThemePreference;
  icon: FeatherIconName;
  titleTx: string;
  bodyTx: string;
}[] = [
  {
    value: 'system',
    icon: 'smartphone',
    titleTx: 'appearance.system',
    bodyTx: 'appearance.systemDescription',
  },
  {
    value: 'light',
    icon: 'sun',
    titleTx: 'appearance.light',
    bodyTx: 'appearance.lightDescription',
  },
  {
    value: 'dark',
    icon: 'moon',
    titleTx: 'appearance.dark',
    bodyTx: 'appearance.darkDescription',
  },
];

export default function Appearance() {
  const { colors, preference, setPreference } = useTheme();

  return (
    <Screen scroll gap="xl" header={{ titleTx: 'appearance.title' }}>
      <Text variant="body" color="textSecondary" tx="appearance.subtitle" />

      <Card padding="md">
        {OPTIONS.map((option) => (
          <ListRow
            key={option.value}
            icon={option.icon}
            titleTx={option.titleTx}
            subtitleTx={option.bodyTx}
            onPress={() => setPreference(option.value)}
            showChevron={false}
            right={
              preference === option.value ? (
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

      {/* Live preview, so the choice is visible before leaving the screen. */}
      <View style={{ rowGap: SPACING.md }}>
        <SectionHeader titleTx="appearance.preview" />

        <Card style={{ rowGap: SPACING.md }}>
          <Text variant="h2" tx="app.name" />
          <Text variant="body" color="textSecondary" tx="app.tagline" />

          <View style={{ columnGap: SPACING.sm, flexDirection: 'row' }}>
            {(['primary', 'success', 'warning', 'danger'] as const).map((tone) => (
              <View
                key={tone}
                style={{
                  backgroundColor: colors[tone],
                  borderRadius: RADIUS.sm,
                  flex: 1,
                  height: 36,
                }}
              />
            ))}
          </View>
        </Card>
      </View>
    </Screen>
  );
}
