import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useGetVehicleQuery, useUpdateVehicleMutation } from '@/apis/autopilotApi';
import type { VehicleDraft } from '@/apis/repositories/vehicles';
import { Screen } from '@/shared/components/layout';
import { EmptyState, SkeletonCard } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { VehicleForm } from '@/features/vehicle';

export default function EditVehicleScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: vehicle, isLoading, isError } = useGetVehicleQuery(id, { skip: !id });
  const [updateVehicle, { isLoading: isSaving }] = useUpdateVehicleMutation();

  const handleSubmit = async (draft: VehicleDraft) => {
    if (!id) return;

    try {
      await updateVehicle({ id, patch: draft }).unwrap();
      toast.success(t('vehicle.editTitle'));
      router.back();
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.saveFailed';
      toast.error(t('errors.saveFailed'), t(message, { defaultValue: message }));
    }
  };

  return (
    <Screen scroll gap="xl" header={{ titleTx: 'vehicle.editTitle' }}>
      {isLoading ? (
        <SkeletonCard count={2} />
      ) : isError || !vehicle ? (
        <EmptyState
          icon="alert-circle"
          titleTx="errors.loadFailed"
          actionTx="common.back"
          onAction={() => router.back()}
        />
      ) : (
        <VehicleForm
          vehicle={vehicle}
          onSubmit={handleSubmit}
          isSubmitting={isSaving}
          submitTx="common.saveChanges"
        />
      )}
    </Screen>
  );
}
