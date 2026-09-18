import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useCreateVehicleMutation } from '@/apis/autopilotApi';
import type { VehicleDraft } from '@/apis/repositories/vehicles';
import { Screen } from '@/shared/components/layout';
import { Button, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { VehicleForm } from '@/features/vehicle';

/**
 * Onboarding step after sign-up.
 *
 * Uses the compact form — make, model, year, odometer and fuel type are
 * enough to start projecting service intervals; the rest can wait.
 */
export default function AddVehicle() {
  const { t } = useTranslation();
  const [createVehicle, { isLoading }] = useCreateVehicleMutation();

  const handleSubmit = async (draft: VehicleDraft) => {
    try {
      await createVehicle({ ...draft, isPrimary: true }).unwrap();
      router.replace('/(main)/(tabs)/Home');
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.saveFailed';
      toast.error(t('errors.saveFailed'), t(message, { defaultValue: message }));
    }
  };

  return (
    <Screen scroll gap="xl" header={{ titleTx: 'onboarding.addVehicleTitle', showBack: false }}>
      <View style={{ rowGap: SPACING.xs }}>
        <Text variant="display" tx="onboarding.addVehicleTitle" />
        <Text variant="body" color="textSecondary" tx="onboarding.addVehicleSubtitle" />
      </View>

      <VehicleForm
        compact
        onSubmit={handleSubmit}
        isSubmitting={isLoading}
        submitTx="onboarding.addVehicleCta"
      />

      <Button
        variant="ghost"
        tx="onboarding.skipForNow"
        fullWidth
        onPress={() => router.replace('/(main)/(tabs)/Home')}
      />
    </Screen>
  );
}
