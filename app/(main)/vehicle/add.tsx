import React from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useCreateVehicleMutation } from '@/apis/autopilotApi';
import type { VehicleDraft } from '@/apis/repositories/vehicles';
import { Screen } from '@/shared/components/layout';
import { toast } from '@/shared/components/ui/Toast';
import { VehicleForm } from '@/features/vehicle';

export default function AddVehicleScreen() {
  const { t } = useTranslation();
  const [createVehicle, { isLoading }] = useCreateVehicleMutation();

  const handleSubmit = async (draft: VehicleDraft) => {
    try {
      await createVehicle(draft).unwrap();
      toast.success(t('vehicle.addTitle'));
      router.back();
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.saveFailed';
      toast.error(t('errors.saveFailed'), t(message, { defaultValue: message }));
    }
  };

  return (
    <Screen scroll gap="xl" header={{ titleTx: 'vehicle.addTitle' }}>
      <VehicleForm onSubmit={handleSubmit} isSubmitting={isLoading} submitTx="common.save" />
    </Screen>
  );
}
