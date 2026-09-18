import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useUpdateOdometerMutation } from '@/apis/autopilotApi';
import type { Vehicle } from '@/@types/models';
import { Sheet } from '@/shared/components/layout';
import { Button, Input, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { formatDistance } from '@/utils/format';

export interface UpdateOdometerSheetProps {
  isVisible: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

/**
 * Odometer update sheet.
 *
 * The reading drives every distance-based reminder, so the mutation rejects a
 * value below the current one and the error is surfaced inline rather than
 * being swallowed.
 */
export default function UpdateOdometerSheet({
  isVisible,
  onClose,
  vehicle,
}: UpdateOdometerSheetProps) {
  const { t } = useTranslation();
  const [updateOdometer, { isLoading }] = useUpdateOdometerMutation();
  const [reading, setReading] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (isVisible) {
      setReading(String(vehicle.odometer));
      setError(undefined);
    }
  }, [isVisible, vehicle.odometer]);

  const handleSave = async () => {
    const parsed = Number(reading);

    if (!Number.isFinite(parsed) || parsed < 0) {
      setError('validation.odometerInvalid');
      return;
    }

    if (parsed < vehicle.odometer) {
      setError('validation.odometerBelowCurrent');
      return;
    }

    try {
      await updateOdometer({ id: vehicle.id, odometer: parsed }).unwrap();
      toast.success(t('vehicle.updateOdometerTitle'), formatDistance(parsed));
      onClose();
    } catch (caught) {
      setError((caught as { message?: string })?.message ?? 'errors.saveFailed');
    }
  };

  return (
    <Sheet
      isVisible={isVisible}
      onClose={onClose}
      titleTx="vehicle.updateOdometerTitle"
      subtitleTx="vehicle.updateOdometerBody"
      footer={
        <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
          <Button variant="outline" tx="common.cancel" onPress={onClose} style={{ flex: 1 }} />
          <Button tx="common.save" loading={isLoading} onPress={handleSave} style={{ flex: 1 }} />
        </View>
      }
    >
      <Input
        labelTx="vehicle.odometer"
        value={reading}
        onChangeText={(value) => {
          setReading(value);
          setError(undefined);
        }}
        keyboardType="number-pad"
        error={error}
        autoFocus
        suffix={<Text variant="labelSm" color="textMuted" tx="units.km" />}
      />

      <Text variant="caption" color="textMuted">
        {t('vehicle.currentReading', { value: formatDistance(vehicle.odometer) })}
      </Text>
    </Sheet>
  );
}
