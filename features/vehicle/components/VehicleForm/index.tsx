import React from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import { SPACING } from '@/constants/Layout';
import type { FuelType, TransmissionType, Vehicle } from '@/@types/models';
import type { VehicleDraft } from '@/apis/repositories/vehicles';
import { Button, FormInput, OptionGroup, Text } from '@/shared/components/ui';
import {
  OPTIONAL_NUMBER_RULES,
  REQUIRED_NUMBER_RULES,
  YEAR_RULES,
} from '@/features/auth/validation';

const FUEL_OPTIONS: { value: FuelType; labelTx: string }[] = [
  { value: 'petrol', labelTx: 'vehicle.fuelTypes.petrol' },
  { value: 'diesel', labelTx: 'vehicle.fuelTypes.diesel' },
  { value: 'hybrid', labelTx: 'vehicle.fuelTypes.hybrid' },
  { value: 'electric', labelTx: 'vehicle.fuelTypes.electric' },
  { value: 'lpg', labelTx: 'vehicle.fuelTypes.lpg' },
];

const TRANSMISSION_OPTIONS: { value: TransmissionType; labelTx: string }[] = [
  { value: 'automatic', labelTx: 'vehicle.transmissions.automatic' },
  { value: 'manual', labelTx: 'vehicle.transmissions.manual' },
  { value: 'cvt', labelTx: 'vehicle.transmissions.cvt' },
  { value: 'dct', labelTx: 'vehicle.transmissions.dct' },
];

interface VehicleFormValues {
  make: string;
  model: string;
  year: string;
  nickname: string;
  plateNumber: string;
  color: string;
  odometer: string;
  tankCapacity: string;
  fuelType: FuelType;
  transmission: TransmissionType;
}

export interface VehicleFormProps {
  /** Existing vehicle when editing; omit to create. */
  vehicle?: Vehicle;
  onSubmit: (draft: VehicleDraft) => void | Promise<void>;
  isSubmitting?: boolean;
  submitTx?: string;
  /** Rendered next to the submit button, e.g. a cancel action. */
  secondaryAction?: React.ReactNode;
  /** Hides fields that are not needed during first-run onboarding. */
  compact?: boolean;
}

/**
 * Create/edit form for a vehicle.
 *
 * Shared between onboarding and vehicle management so the two can never drift
 * apart in fields, validation or defaults.
 */
export default function VehicleForm({
  vehicle,
  onSubmit,
  isSubmitting = false,
  submitTx = 'common.save',
  secondaryAction,
  compact = false,
}: VehicleFormProps) {
  const { control, handleSubmit } = useForm<VehicleFormValues>({
    defaultValues: {
      make: vehicle?.make ?? '',
      model: vehicle?.model ?? '',
      year: vehicle?.year ? String(vehicle.year) : '',
      nickname: vehicle?.nickname ?? '',
      plateNumber: vehicle?.plateNumber ?? '',
      color: vehicle?.color ?? '',
      odometer: vehicle?.odometer != null ? String(vehicle.odometer) : '',
      tankCapacity: vehicle?.tankCapacity != null ? String(vehicle.tankCapacity) : '',
      fuelType: vehicle?.fuelType ?? 'petrol',
      transmission: vehicle?.transmission ?? 'automatic',
    },
  });

  const submit = (values: VehicleFormValues) => {
    onSubmit({
      make: values.make.trim(),
      model: values.model.trim(),
      year: Number(values.year),
      nickname: values.nickname.trim() || undefined,
      plateNumber: values.plateNumber.trim() || undefined,
      color: values.color.trim() || undefined,
      odometer: Number(values.odometer),
      tankCapacity: values.tankCapacity ? Number(values.tankCapacity) : undefined,
      fuelType: values.fuelType,
      transmission: values.transmission,
    });
  };

  return (
    <View style={{ rowGap: SPACING.xl }}>
      <View style={{ rowGap: SPACING.lg }}>
        <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
          <FormInput
            control={control}
            name="make"
            labelTx="vehicle.make"
            placeholderTx="vehicle.makePlaceholder"
            autoCapitalize="words"
            required
            containerStyle={{ flex: 1 }}
          />
          <FormInput
            control={control}
            name="model"
            labelTx="vehicle.model"
            placeholderTx="vehicle.modelPlaceholder"
            autoCapitalize="words"
            required
            containerStyle={{ flex: 1 }}
          />
        </View>

        <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
          <FormInput
            control={control}
            name="year"
            labelTx="vehicle.year"
            placeholderTx="vehicle.yearPlaceholder"
            keyboardType="number-pad"
            maxLength={4}
            required
            rules={YEAR_RULES}
            containerStyle={{ flex: 1 }}
          />
          <FormInput
            control={control}
            name="odometer"
            labelTx="vehicle.odometer"
            placeholderTx="vehicle.odometerPlaceholder"
            keyboardType="number-pad"
            required
            rules={REQUIRED_NUMBER_RULES}
            containerStyle={{ flex: 1 }}
          />
        </View>

        <Controller
          control={control}
          name="fuelType"
          render={({ field: { onChange, value } }) => (
            <OptionGroup
              labelTx="vehicle.fuelType"
              options={FUEL_OPTIONS}
              value={value}
              onChange={onChange}
            />
          )}
        />

        {!compact && (
          <>
            <Controller
              control={control}
              name="transmission"
              render={({ field: { onChange, value } }) => (
                <OptionGroup
                  labelTx="vehicle.transmission"
                  options={TRANSMISSION_OPTIONS}
                  value={value}
                  onChange={onChange}
                />
              )}
            />

            <FormInput
              control={control}
              name="nickname"
              labelTx="vehicle.nickname"
              placeholderTx="vehicle.nicknamePlaceholder"
            />

            <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
              <FormInput
                control={control}
                name="plateNumber"
                labelTx="vehicle.plateNumber"
                autoCapitalize="characters"
                containerStyle={{ flex: 1 }}
              />
              <FormInput
                control={control}
                name="color"
                labelTx="vehicle.color"
                autoCapitalize="words"
                containerStyle={{ flex: 1 }}
              />
            </View>

            <FormInput
              control={control}
              name="tankCapacity"
              labelTx="vehicle.tankCapacity"
              hintTx="vehicle.tankCapacityHint"
              keyboardType="decimal-pad"
              rules={OPTIONAL_NUMBER_RULES}
              suffix={<Text variant="labelSm" color="textMuted" tx="units.liter" />}
            />
          </>
        )}
      </View>

      <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
        {secondaryAction}
        <Button
          tx={submitTx}
          size="lg"
          loading={isSubmitting}
          onPress={handleSubmit(submit)}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
