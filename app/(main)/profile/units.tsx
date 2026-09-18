import React from 'react';

import { SPACING } from '@/constants/Layout';
import { useGetPreferencesQuery, useUpdatePreferencesMutation } from '@/apis/autopilotApi';
import type { CurrencyCode, DistanceUnit, VolumeUnit } from '@/@types/models';
import { Screen } from '@/shared/components/layout';
import { Card, OptionGroup, SkeletonCard, Text } from '@/shared/components/ui';

const DISTANCE_OPTIONS: { value: DistanceUnit; labelTx: string }[] = [
  { value: 'km', labelTx: 'unitsSettings.kilometers' },
  { value: 'mi', labelTx: 'unitsSettings.miles' },
];

const VOLUME_OPTIONS: { value: VolumeUnit; labelTx: string }[] = [
  { value: 'liter', labelTx: 'unitsSettings.liters' },
  { value: 'gallon', labelTx: 'unitsSettings.gallons' },
];

const CURRENCIES: CurrencyCode[] = ['EGP', 'USD', 'EUR', 'SAR', 'AED', 'GBP'];

export default function Units() {
  const { data: preferences, isLoading } = useGetPreferencesQuery();
  const [updatePreferences] = useUpdatePreferencesMutation();

  if (isLoading || !preferences) {
    return (
      <Screen scroll header={{ titleTx: 'unitsSettings.title' }}>
        <SkeletonCard count={2} />
      </Screen>
    );
  }

  return (
    <Screen scroll gap="xl" header={{ titleTx: 'unitsSettings.title' }}>
      <Text variant="body" color="textSecondary" tx="unitsSettings.subtitle" />

      <Card style={{ rowGap: SPACING.xl }}>
        <OptionGroup
          labelTx="unitsSettings.distance"
          options={DISTANCE_OPTIONS}
          value={preferences.distanceUnit}
          onChange={(distanceUnit) => updatePreferences({ distanceUnit })}
        />

        <OptionGroup
          labelTx="unitsSettings.volume"
          options={VOLUME_OPTIONS}
          value={preferences.volumeUnit}
          onChange={(volumeUnit) => updatePreferences({ volumeUnit })}
        />

        <OptionGroup
          labelTx="unitsSettings.currency"
          options={CURRENCIES.map((value) => ({ value, label: value }))}
          value={preferences.currency}
          onChange={(currency) => updatePreferences({ currency })}
        />
      </Card>
    </Screen>
  );
}
