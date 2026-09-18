import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { SPACING } from '@/constants/Layout';
import { useCreateTripMutation, useUpdateTripMutation } from '@/apis/autopilotApi';
import type { Trip } from '@/@types/models';
import { Sheet } from '@/shared/components/layout';
import { Button, DateField, FormInput, Switch, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { OPTIONAL_NUMBER_RULES, REQUIRED_NUMBER_RULES } from '@/features/auth/validation';

interface TripFormValues {
  name: string;
  origin: string;
  destination: string;
  distanceKm: string;
  isRoundTrip: boolean;
  departureDate: string;
  returnDate: string;
  fuelPricePerLiter: string;
  travellers: string;
  notes: string;
}

export interface TripSheetProps {
  isVisible: boolean;
  onClose: () => void;
  vehicleId: string;
  /** Price from the most recent fill-up, used as the default. */
  lastFuelPrice?: number;
  trip?: Trip;
}

/** Create/edit sheet for a planned trip. */
export default function TripSheet({
  isVisible,
  onClose,
  vehicleId,
  lastFuelPrice,
  trip,
}: TripSheetProps) {
  const { t } = useTranslation();
  const [createTrip, { isLoading: isCreating }] = useCreateTripMutation();
  const [updateTrip, { isLoading: isUpdating }] = useUpdateTripMutation();

  const { control, handleSubmit, reset, watch } = useForm<TripFormValues>({
    defaultValues: {
      name: '',
      origin: '',
      destination: '',
      distanceKm: '',
      isRoundTrip: true,
      departureDate: dayjs().add(7, 'day').toISOString(),
      returnDate: '',
      fuelPricePerLiter: '',
      travellers: '2',
      notes: '',
    },
  });

  const departureDate = watch('departureDate');

  useEffect(() => {
    if (!isVisible) return;

    reset({
      name: trip?.name ?? '',
      origin: trip?.origin ?? '',
      destination: trip?.destination ?? '',
      distanceKm: trip?.distanceKm != null ? String(trip.distanceKm) : '',
      isRoundTrip: trip?.isRoundTrip ?? true,
      departureDate: trip?.departureDate ?? dayjs().add(7, 'day').toISOString(),
      returnDate: trip?.returnDate ?? '',
      fuelPricePerLiter: String(trip?.fuelPricePerLiter ?? lastFuelPrice ?? ''),
      travellers: String(trip?.travellers ?? 2),
      notes: trip?.notes ?? '',
    });
  }, [isVisible, trip, lastFuelPrice, reset]);

  const onSubmit = async (values: TripFormValues) => {
    const draft = {
      vehicleId,
      name: values.name.trim(),
      origin: values.origin.trim(),
      destination: values.destination.trim(),
      distanceKm: Number(values.distanceKm),
      isRoundTrip: values.isRoundTrip,
      departureDate: values.departureDate,
      returnDate: values.returnDate || undefined,
      fuelPricePerLiter: Number(values.fuelPricePerLiter) || 0,
      currency: 'EGP' as const,
      travellers: Number(values.travellers) || 1,
      notes: values.notes.trim() || undefined,
    };

    try {
      if (trip) {
        await updateTrip({ id: trip.id, patch: draft }).unwrap();
      } else {
        await createTrip(draft).unwrap();
      }

      toast.success(t(trip ? 'trips.editTitle' : 'trips.addTitle'));
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
      titleTx={trip ? 'trips.editTitle' : 'trips.addTitle'}
      subtitleTx={trip ? undefined : 'trips.addSubtitle'}
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
      <FormInput
        control={control}
        name="name"
        labelTx="trips.tripName"
        placeholderTx="trips.tripNamePlaceholder"
        required
      />

      <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
        <FormInput
          control={control}
          name="origin"
          labelTx="trips.origin"
          autoCapitalize="words"
          required
          containerStyle={{ flex: 1 }}
        />
        <FormInput
          control={control}
          name="destination"
          labelTx="trips.destination"
          autoCapitalize="words"
          required
          containerStyle={{ flex: 1 }}
        />
      </View>

      <FormInput
        control={control}
        name="distanceKm"
        labelTx="trips.distance"
        hintTx="trips.distanceHint"
        keyboardType="number-pad"
        required
        rules={REQUIRED_NUMBER_RULES}
        suffix={<Text variant="labelSm" color="textMuted" tx="units.km" />}
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
          <Text variant="label" tx="trips.roundTrip" />
          <Text variant="caption" color="textMuted" tx="trips.roundTripHint" />
        </View>

        <Controller
          control={control}
          name="isRoundTrip"
          render={({ field: { onChange, value } }) => (
            <Switch value={value} onValueChange={onChange} />
          )}
        />
      </View>

      <Controller
        control={control}
        name="departureDate"
        render={({ field: { onChange, value } }) => (
          <DateField labelTx="trips.departureDate" value={value} onChange={onChange} required />
        )}
      />

      <Controller
        control={control}
        name="returnDate"
        render={({ field: { onChange, value } }) => (
          <DateField
            labelTx="trips.returnDate"
            value={value}
            onChange={onChange}
            minDate={departureDate}
            clearable
          />
        )}
      />

      <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
        <FormInput
          control={control}
          name="fuelPricePerLiter"
          labelTx="trips.fuelPrice"
          keyboardType="decimal-pad"
          required
          rules={REQUIRED_NUMBER_RULES}
          containerStyle={{ flex: 1 }}
        />
        <FormInput
          control={control}
          name="travellers"
          labelTx="trips.travellers"
          hintTx="trips.travellersHint"
          keyboardType="number-pad"
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
