import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { SPACING } from '@/constants/Layout';
import { useCreateFuelEntryMutation, useUpdateFuelEntryMutation } from '@/apis/autopilotApi';
import type { FuelEntry } from '@/@types/models';
import { Sheet } from '@/shared/components/layout';
import { Button, DateField, FormInput, Switch, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { OPTIONAL_NUMBER_RULES, REQUIRED_NUMBER_RULES } from '@/features/auth/validation';
import { formatDistance } from '@/utils/format';

interface FuelFormValues {
  date: string;
  odometer: string;
  liters: string;
  pricePerLiter: string;
  totalCost: string;
  stationName: string;
  notes: string;
  isFullTank: boolean;
}

export interface FuelEntrySheetProps {
  isVisible: boolean;
  onClose: () => void;
  vehicleId: string;
  /** Odometer of the previous fill-up, shown as a hint and used to validate. */
  lastOdometer?: number;
  entry?: FuelEntry;
}

/** Create/edit sheet for a fuel fill-up. */
export default function FuelEntrySheet({
  isVisible,
  onClose,
  vehicleId,
  lastOdometer,
  entry,
}: FuelEntrySheetProps) {
  const { t } = useTranslation();
  const [createEntry, { isLoading: isCreating }] = useCreateFuelEntryMutation();
  const [updateEntry, { isLoading: isUpdating }] = useUpdateFuelEntryMutation();

  const { control, handleSubmit, reset, watch } = useForm<FuelFormValues>({
    defaultValues: {
      date: dayjs().toISOString(),
      odometer: '',
      liters: '',
      pricePerLiter: '',
      totalCost: '',
      stationName: '',
      notes: '',
      isFullTank: true,
    },
  });

  const liters = watch('liters');
  const pricePerLiter = watch('pricePerLiter');

  useEffect(() => {
    if (!isVisible) return;

    reset({
      date: entry?.date ?? dayjs().toISOString(),
      odometer: entry?.odometer != null ? String(entry.odometer) : '',
      liters: entry?.liters != null ? String(entry.liters) : '',
      pricePerLiter: entry?.pricePerLiter != null ? String(entry.pricePerLiter) : '',
      totalCost: entry?.totalCost != null ? String(entry.totalCost) : '',
      stationName: entry?.stationName ?? '',
      notes: entry?.notes ?? '',
      isFullTank: entry?.isFullTank ?? true,
    });
  }, [isVisible, entry, reset]);

  /** Live preview of the computed total, so the user can sanity-check it. */
  const computedTotal =
    Number(liters) > 0 && Number(pricePerLiter) > 0
      ? (Number(liters) * Number(pricePerLiter)).toFixed(2)
      : null;

  const onSubmit = async (values: FuelFormValues) => {
    const draft = {
      vehicleId,
      date: values.date,
      odometer: Number(values.odometer),
      liters: Number(values.liters),
      pricePerLiter: values.pricePerLiter ? Number(values.pricePerLiter) : undefined,
      totalCost: values.totalCost ? Number(values.totalCost) : undefined,
      currency: 'EGP' as const,
      stationName: values.stationName.trim() || undefined,
      notes: values.notes.trim() || undefined,
      isFullTank: values.isFullTank,
    };

    try {
      if (entry) {
        await updateEntry({ id: entry.id, patch: draft }).unwrap();
      } else {
        await createEntry(draft).unwrap();
      }

      toast.success(t(entry ? 'fuel.editTitle' : 'fuel.addTitle'));
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
      titleTx={entry ? 'fuel.editTitle' : 'fuel.addTitle'}
      subtitleTx={entry ? undefined : 'fuel.addSubtitle'}
      footer={
        <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
          <Button variant="outline" tx="common.cancel" onPress={onClose} style={{ flex: 1 }} />
          <Button
            tx="common.save"
            loading={isCreating || isUpdating}
            onPress={handleSubmit(onSubmit)}
            style={{ flex: 1.4 }}
          />
        </View>
      }
    >
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

      <FormInput
        control={control}
        name="odometer"
        labelTx="fuel.odometer"
        hint={
          lastOdometer != null
            ? t('fuel.odometerHint', { odometer: formatDistance(lastOdometer) })
            : undefined
        }
        keyboardType="number-pad"
        required
        rules={{
          ...REQUIRED_NUMBER_RULES,
          validate: (value: string) => {
            const parsed = Number(value);
            if (!Number.isFinite(parsed) || parsed <= 0) return 'validation.mustBePositive';
            if (lastOdometer != null && parsed < lastOdometer && !entry) {
              return 'validation.odometerBelowCurrent';
            }
            return true;
          },
        }}
        suffix={<Text variant="labelSm" color="textMuted" tx="units.km" />}
      />

      <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
        <FormInput
          control={control}
          name="liters"
          labelTx="fuel.liters"
          keyboardType="decimal-pad"
          required
          rules={REQUIRED_NUMBER_RULES}
          containerStyle={{ flex: 1 }}
        />
        <FormInput
          control={control}
          name="pricePerLiter"
          labelTx="fuel.pricePerLiter"
          keyboardType="decimal-pad"
          rules={OPTIONAL_NUMBER_RULES}
          containerStyle={{ flex: 1 }}
        />
      </View>

      <FormInput
        control={control}
        name="totalCost"
        labelTx="fuel.totalCost"
        hint={computedTotal ? `${computedTotal}` : t('fuel.totalCostHint')}
        keyboardType="decimal-pad"
        rules={OPTIONAL_NUMBER_RULES}
      />

      <View
        style={{
          alignItems: 'center',
          columnGap: SPACING.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="label" tx="fuel.fullTank" />
          <Text variant="caption" color="textMuted" tx="fuel.fullTankHint" />
        </View>

        <Controller
          control={control}
          name="isFullTank"
          render={({ field: { onChange, value } }) => (
            <Switch value={value} onValueChange={onChange} />
          )}
        />
      </View>

      <FormInput
        control={control}
        name="stationName"
        labelTx="fuel.station"
        placeholderTx="fuel.stationPlaceholder"
      />

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
