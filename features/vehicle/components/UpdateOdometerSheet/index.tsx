import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useUpdateOdometerMutation } from '@/apis/autopilotApi';
import { useTheme } from '@/theme';
import type { Vehicle } from '@/@types/models';
import { Sheet } from '@/shared/components/layout';
import { Button, Input, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { formatDistance, formatRelative } from '@/utils/format';

export interface UpdateOdometerSheetProps {
  isVisible: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  /**
   * True when the sheet opened on its own because the reading went stale.
   * Changes the copy to explain why it appeared and softens the dismiss
   * action, so an unrequested sheet does not read as a demand.
   */
  isPrompted?: boolean;
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
  isPrompted = false,
}: UpdateOdometerSheetProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [updateOdometer, { isLoading }] = useUpdateOdometerMutation();
  const [reading, setReading] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!isVisible) return;

    /**
     * A prompted sheet starts empty: the point is to type a *new* number, and
     * pre-filling the old one invites saving it unchanged. Opening it manually
     * usually means a small correction, so there the current value is handy.
     */
    setReading(isPrompted ? '' : String(vehicle.odometer));
    setError(undefined);
  }, [isVisible, isPrompted, vehicle.odometer]);

  const handleSave = async () => {
    const parsed = Number(reading);

    if (!reading.trim() || !Number.isFinite(parsed) || parsed < 0) {
      setError('validation.odometerInvalid');
      return;
    }

    if (parsed < vehicle.odometer) {
      setError('validation.odometerBelowCurrent');
      return;
    }

    try {
      await updateOdometer({ id: vehicle.id, odometer: parsed }).unwrap();

      const driven = parsed - vehicle.odometer;
      toast.success(
        t('vehicle.updateOdometerTitle'),
        driven > 0
          ? t('vehicle.odometerSavedDriven', { distance: formatDistance(driven) })
          : formatDistance(parsed)
      );

      onClose();
    } catch (caught) {
      setError((caught as { message?: string })?.message ?? 'errors.saveFailed');
    }
  };

  return (
    <Sheet
      isVisible={isVisible}
      onClose={onClose}
      titleTx={isPrompted ? 'vehicle.odometerPromptTitle' : 'vehicle.updateOdometerTitle'}
      subtitleTx={isPrompted ? 'vehicle.odometerPromptBody' : 'vehicle.updateOdometerBody'}
      footer={
        <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
          <Button
            variant={isPrompted ? 'ghost' : 'outline'}
            tx={isPrompted ? 'vehicle.odometerPromptLater' : 'common.cancel'}
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <Button tx="common.save" loading={isLoading} onPress={handleSave} style={{ flex: 1.2 }} />
        </View>
      }
    >
      <Input
        labelTx="vehicle.odometer"
        placeholderTx="vehicle.odometerPlaceholder"
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

      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.surfaceAlt,
          borderRadius: RADIUS.md,
          columnGap: SPACING.sm,
          flexDirection: 'row',
          padding: SPACING.md,
        }}
      >
        <Feather name="activity" size={16} color={colors.textMuted} />

        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="labelSm" color="textSecondary">
            {t('vehicle.currentReading', { value: formatDistance(vehicle.odometer) })}
          </Text>

          {!!vehicle.odometerUpdatedAt && (
            <Text variant="caption" color="textMuted">
              {t('vehicle.odometerUpdated', { when: formatRelative(vehicle.odometerUpdatedAt) })}
            </Text>
          )}
        </View>
      </View>
    </Sheet>
  );
}
