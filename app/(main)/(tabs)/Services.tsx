import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { Screen } from '@/shared/components/layout';
import { Text } from '@/shared/components/ui';
import type { ColorToken } from '@/constants/Colors';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

interface ServiceTile {
  key: string;
  icon: FeatherIconName;
  titleTx: string;
  descriptionTx: string;
  fg: ColorToken;
  bg: ColorToken;
  href: string;
}

/**
 * The service catalogue.
 *
 * Accent colors come from the theme's fixed accent set rather than one-off
 * hexes, so the grid stays coherent and works in dark mode.
 */
const SERVICES: ServiceTile[] = [
  {
    key: 'fuel',
    icon: 'droplet',
    titleTx: 'services.fuel',
    descriptionTx: 'services.fuelDescription',
    fg: 'primary',
    bg: 'primarySoft',
    href: '/(main)/services/gas-consumption',
  },
  {
    key: 'reminders',
    icon: 'bell',
    titleTx: 'services.reminders',
    descriptionTx: 'services.remindersDescription',
    fg: 'accentViolet',
    bg: 'accentVioletSoft',
    href: '/(main)/services/service-reminders',
  },
  {
    key: 'documents',
    icon: 'file-text',
    titleTx: 'services.documents',
    descriptionTx: 'services.documentsDescription',
    fg: 'accentBlue',
    bg: 'accentBlueSoft',
    href: '/(main)/services/vehicle-documents',
  },
  {
    key: 'errors',
    icon: 'alert-triangle',
    titleTx: 'services.errorsGuide',
    descriptionTx: 'services.errorsGuideDescription',
    fg: 'accentRose',
    bg: 'accentRoseSoft',
    href: '/(main)/services/errors-guide',
  },
  {
    key: 'climate',
    icon: 'wind',
    titleTx: 'services.climate',
    descriptionTx: 'services.climateDescription',
    fg: 'accentTeal',
    bg: 'accentTealSoft',
    href: '/(main)/services/climate-comfort',
  },
  {
    key: 'trips',
    icon: 'map',
    titleTx: 'services.trips',
    descriptionTx: 'services.tripsDescription',
    fg: 'accentGreen',
    bg: 'accentGreenSoft',
    href: '/(main)/services/roadtrip-planner',
  },
];

export default function Services() {
  const { colors } = useTheme();

  return (
    <Screen
      scroll
      hasTabBar
      header={{
        titleTx: 'services.title',
        subtitleTx: 'services.subtitle',
        variant: 'large',
        showBack: false,
      }}
    >
      <View
        style={{
          columnGap: SPACING.md,
          flexDirection: 'row',
          flexWrap: 'wrap',
          rowGap: SPACING.md,
        }}
      >
        {SERVICES.map((service) => (
          <Pressable
            key={service.key}
            onPress={() => router.push(service.href as never)}
            accessibilityRole="button"
            style={({ pressed }) => [
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: RADIUS.lg,
                borderWidth: 1,
                flexBasis: '47%',
                flexGrow: 1,
                minHeight: 148,
                padding: SPACING.lg,
                rowGap: SPACING.sm,
              },
              pressed && { opacity: 0.75 },
            ]}
          >
            <View
              style={{
                alignItems: 'center',
                backgroundColor: colors[service.bg],
                borderRadius: RADIUS.md,
                height: 44,
                justifyContent: 'center',
                marginBottom: SPACING.xs,
                width: 44,
              }}
            >
              <Feather name={service.icon} size={20} color={colors[service.fg]} />
            </View>

            <Text variant="h3" tx={service.titleTx} numberOfLines={2} />
            <Text
              variant="caption"
              color="textSecondary"
              tx={service.descriptionTx}
              numberOfLines={3}
            />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
