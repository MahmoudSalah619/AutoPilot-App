import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { SPACING } from '@/constants/Layout';
import { useCreateClimateRecordMutation } from '@/apis/autopilotApi';
import { CLIMATE_INTERVALS } from '@/apis/repositories/climate';
import type { ClimateServiceType } from '@/@types/models';
import { Sheet } from '@/shared/components/layout';
import { Button, DateField, FormInput, OptionGroup, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { OPTIONAL_NUMBER_RULES } from '@/features/auth/validation';

const TYPE_OPTIONS = (Object.keys(CLIMATE_INTERVALS) as ClimateServiceType[]).map((value) => ({
  value,
  labelTx: `climate.types.${value}`,
}));

interface ClimateFormValues {
  type: ClimateServiceType;
  date: string;
  odometer: string;
  cost: string;
  notes: string;
}

export interface ClimateLogSheetProps {
  isVisible: boolean;
  onClose: () => void;
  vehicleId: string;
  currentOdometer?: number;
  /** Pre-selects the service the user tapped on the health list. */
  initialType?: ClimateServiceType;
}

/** Logs a completed climate service. */
export default function ClimateLogSheet({
  isVisible,
  onClose,
  vehicleId,
  currentOdometer,
  initialType,
}: ClimateLogSheetProps) {
  const { t } = useTranslation();
  const [createRecord, { isLoading }] = useCreateClimateRecordMutation();

  const { control, handleSubmit, reset } = useForm<ClimateFormValues>({
    defaultValues: {
      type: 'cabinFilter',
      date: dayjs().toISOString(),
      odometer: '',
      cost: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!isVisible) return;

    reset({
      type: initialType ?? 'cabinFilter',
      date: dayjs().toISOString(),
      odometer: currentOdometer != null ? String(currentOdometer) : '',
      cost: '',
      notes: '',
    });
  }, [isVisible, initialType, currentOdometer, reset]);

  const onSubmit = async (values: ClimateFormValues) => {
    try {
      await createRecord({
        vehicleId,
        type: values.type,
        date: values.date,
        odometer: values.odometer ? Number(values.odometer) : undefined,
        cost: values.cost ? Number(values.cost) : undefined,
        currency: 'EGP',
        notes: values.notes.trim() || undefined,
        intervalMonths: CLIMATE_INTERVALS[values.type],
      }).unwrap();

      toast.success(t('climate.logTitle'));
      onClose();
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.saveFailed';
      toast.error(t('errors.saveFailed'), t(message, { defaultValue: message }));
    }
  };

  return (
    <Sheet
      isVisible={isVisible}
      onClose={onClose}
      titleTx="climate.logTitle"
      subtitleTx="climate.logSubtitle"
      footer={
        <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
          <Button variant="outline" tx="common.cancel" onPress={onClose} style={{ flex: 1 }} />
          <Button
            tx="common.save"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
            style={{ flex: 1.4 }}
          />
        </View>
      }
    >
      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <OptionGroup
            labelTx="climate.serviceType"
            options={TYPE_OPTIONS}
            value={value}
            onChange={onChange}
            required
          />
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, value } }) => (
          <DateField
            labelTx="common.date"
            value={value}
            onChange={onChange}
            maxDate={dayjs().toISOString()}
            required
          />
        )}
      />

      <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
        <FormInput
          control={control}
          name="odometer"
          labelTx="vehicle.odometer"
          keyboardType="number-pad"
          rules={OPTIONAL_NUMBER_RULES}
          containerStyle={{ flex: 1 }}
          suffix={<Text variant="labelSm" color="textMuted" tx="units.km" />}
        />
        <FormInput
          control={control}
          name="cost"
          labelTx="common.cost"
          keyboardType="decimal-pad"
          rules={OPTIONAL_NUMBER_RULES}
          containerStyle={{ flex: 1 }}
        />
      </View>

      <FormInput
        control={control}
        name="notes"
        labelTx="common.notes"
        placeholderTx="common.notesPlaceholder"
        multilineBox
      />
    </Sheet>
  );
}
