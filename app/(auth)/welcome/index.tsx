import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { Screen } from '@/shared/components/layout';
import { Button, Card, Logo, Text } from '@/shared/components/ui';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

const FEATURES: { icon: FeatherIconName; titleTx: string; bodyTx: string }[] = [
  {
    icon: 'trending-up',
    titleTx: 'auth.features.predictiveTitle',
    bodyTx: 'auth.features.predictiveBody',
  },
  {
    icon: 'bell',
    titleTx: 'auth.features.alertsTitle',
    bodyTx: 'auth.features.alertsBody',
  },
  {
    icon: 'folder',
    titleTx: 'auth.features.recordsTitle',
    bodyTx: 'auth.features.recordsBody',
  },
];

export default function Welcome() {
  const { colors } = useTheme();

  return (
    <Screen
      scroll
      gap="xxl"
      footer={
        <View style={{ rowGap: SPACING.md }}>
          <Button
            tx="auth.getStarted"
            size="lg"
            fullWidth
            onPress={() => router.push('/(auth)/signup')}
          />
          <Button
            variant="ghost"
            tx="auth.signIn"
            fullWidth
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      }
    >
      <View style={{ alignItems: 'center', paddingTop: SPACING.xxl, rowGap: SPACING.xl }}>
        <Logo size={72} />

        <View style={{ rowGap: SPACING.md }}>
          <Text variant="displayLg" align="center" tx="auth.welcomeTitle" />
          <Text variant="bodyLg" color="textSecondary" align="center" tx="auth.welcomeBody" />
        </View>
      </View>

      <View style={{ rowGap: SPACING.md }}>
        {FEATURES.map((feature) => (
          <Card key={feature.titleTx} variant="outlined">
            <View style={{ columnGap: SPACING.lg, flexDirection: 'row' }}>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: colors.primarySoft,
                  borderRadius: RADIUS.md,
                  height: 44,
                  justifyContent: 'center',
                  width: 44,
                }}
              >
                <Feather name={feature.icon} size={20} color={colors.primary} />
              </View>

              <View style={{ flex: 1, rowGap: SPACING.xs }}>
                <Text variant="h3" tx={feature.titleTx} />
                <Text variant="bodySm" color="textSecondary" tx={feature.bodyTx} />
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
