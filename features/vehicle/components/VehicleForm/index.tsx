import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import { SPACING } from '@/constants/Layout';
import type { FuelType, TransmissionType, Vehicle } from '@/@types/models';
import { useGetCarMakesQuery, useGetCarModelsQuery } from '@/apis/autopilotApi';
import type { VehicleDraft } from '@/apis/repositories/vehicles';
import { Button, FormInput, OptionGroup, SelectField, Text } from '@/shared/components/ui';
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
  // `vehicles.make` is a foreign key into `car_makes`, so a typed-in make
  // has nowhere to go — it has to be picked from the catalogue. When that
  // catalogue is unreachable (mock mode) the field degrades to free text.
  const { data: carMakes = [], isLoading: areMakesLoading } = useGetCarMakesQuery();

  const makeOptions = useMemo(
    () => carMakes.map((make) => ({ value: make.name, label: make.name })),
    [carMakes]
  );

  const { control, handleSubmit, watch, setValue } = useForm<VehicleFormValues>({
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

  // Models are scoped to the chosen make, so the picker needs the make's id
  // rather than the name the form holds.
  const selectedMake = watch('make');
  const selectedMakeId = useMemo(
    () => carMakes.find((make) => make.name === selectedMake)?.id,
    [carMakes, selectedMake]
  );

  const { data: carModels = [], isLoading: areModelsLoading } = useGetCarModelsQuery(
    selectedMakeId,
    { skip: !selectedMakeId }
  );

  // `car_models` can hold one row per model year, so names are collapsed.
  const modelOptions = useMemo(
    () =>
      [...new Set(carModels.map((model) => model.name))].map((name) => ({
        value: name,
        label: name,
      })),
    [carModels]
  );

  // Changing the make invalidates the model. Keyed off the previous value
  // rather than firing on mount, so opening the form to edit an existing
  // vehicle does not wipe the model the user already chose.
  const previousMake = useRef(selectedMake);

  useEffect(() => {
    if (previousMake.current === selectedMake) return;

    const hadMake = Boolean(previousMake.current);
    previousMake.current = selectedMake;

    if (hadMake) setValue('model', '');
  }, [selectedMake, setValue]);

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
          {makeOptions.length > 0 ? (
            <Controller
              control={control}
              name="make"
              rules={{ required: 'validation.required' }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <SelectField
                  options={makeOptions}
                  value={value}
                  onChange={onChange}
                  labelTx="vehicle.make"
                  placeholderTx="vehicle.makePlaceholder"
                  error={error?.message}
                  isLoading={areMakesLoading}
                  required
                  containerStyle={{ flex: 1 }}
                />
              )}
            />
          ) : (
            <FormInput
              control={control}
              name="make"
              labelTx="vehicle.make"
              placeholderTx="vehicle.makePlaceholder"
              autoCapitalize="words"
              required
              containerStyle={{ flex: 1 }}
            />
          )}
          {makeOptions.length > 0 ? (
            // Locked until a make is chosen, then scoped to that make's
            // models. No catalogue is complete, so a model that is not listed
            // can still be typed in — `vehicles.model` is a plain text column.
            <Controller
              control={control}
              name="model"
              rules={{ required: 'validation.required' }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <SelectField
                  options={modelOptions}
                  value={value}
                  onChange={onChange}
                  labelTx="vehicle.model"
                  placeholderTx={
                    selectedMakeId ? 'vehicle.modelPlaceholder' : 'vehicle.modelNeedsMake'
                  }
                  error={error?.message}
                  isLoading={areModelsLoading}
                  disabled={!selectedMakeId}
                  allowCustom
                  required
                  containerStyle={{ flex: 1 }}
                />
              )}
            />
          ) : (
            // No make catalogue (mock mode), so there is nothing to scope a
            // model list to and both fields are free text.
            <FormInput
              control={control}
              name="model"
              labelTx="vehicle.model"
              placeholderTx="vehicle.modelPlaceholder"
              autoCapitalize="words"
              required
              containerStyle={{ flex: 1 }}
            />
          )}
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
