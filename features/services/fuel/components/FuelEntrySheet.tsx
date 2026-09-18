import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { useCreateFuelEntryMutation, useUpdateFuelEntryMutation } from '@/apis/autopilotApi';
import type { FuelEntry } from '@/@types/models';
import { Sheet } from '@/shared/components/layout';
import { Button, Collapsible, DateField, FormInput, Switch, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { OPTIONAL_NUMBER_RULES, REQUIRED_NUMBER_RULES } from '@/features/auth/validation';
import { formatCurrency, formatDistance, formatNumber } from '@/utils/format';

interface FuelFormValues {
  date: string;
  odometer: string;
  liters: string;
  totalCost: string;
  pricePerLiter: string;
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

/**
 * Create/edit sheet for a fuel fill-up.
 *
 * Only four things are asked for up front — when, the odometer, how much fuel,
 * and what it cost — because those are what economy is calculated from. Price
 * per liter is derived from the other two and shown back, and the fields that
 * only some drivers care about sit behind a disclosure rather than padding out
 * the form everybody sees.
 */
export default function FuelEntrySheet({
  isVisible,
  onClose,
  vehicleId,
  lastOdometer,
  entry,
}: FuelEntrySheetProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [createEntry, { isLoading: isCreating }] = useCreateFuelEntryMutation();
  const [updateEntry, { isLoading: isUpdating }] = useUpdateFuelEntryMutation();

  const { control, handleSubmit, reset, watch } = useForm<FuelFormValues>({
    defaultValues: {
      date: dayjs().toISOString(),
      odometer: '',
      liters: '',
      totalCost: '',
      pricePerLiter: '',
      stationName: '',
      notes: '',
      isFullTank: true,
    },
  });

  const liters = watch('liters');
  const totalCost = watch('totalCost');
  const pricePerLiter = watch('pricePerLiter');

  useEffect(() => {
    if (!isVisible) return;

    reset({
      date: entry?.date ?? dayjs().toISOString(),
      odometer: entry?.odometer != null ? String(entry.odometer) : '',
      liters: entry?.liters != null ? String(entry.liters) : '',
      totalCost: entry?.totalCost != null ? String(entry.totalCost) : '',
      pricePerLiter: entry?.pricePerLiter != null ? String(entry.pricePerLiter) : '',
      stationName: entry?.stationName ?? '',
      notes: entry?.notes ?? '',
      isFullTank: entry?.isFullTank ?? true,
    });
  }, [isVisible, entry, reset]);

  const litersValue = Number(liters);
  const totalValue = Number(totalCost);
  const priceValue = Number(pricePerLiter);

  /**
   * Whichever of the pair is missing gets worked out from the other, so the
   * driver can enter the number they actually know. Fuel here is bought by the
   * pump total far more often than by the posted price per liter.
   */
  const derived =
    litersValue > 0 && totalValue > 0
      ? {
          labelTx: 'fuel.derivedPrice',
          value: `${formatNumber(totalValue / litersValue, 2)} EGP`,
        }
      : litersValue > 0 && priceValue > 0
        ? {
            labelTx: 'fuel.derivedTotal',
            value: formatCurrency(litersValue * priceValue, entry?.currency ?? 'EGP'),
          }
        : null;

  /** Editing an entry that already carries extras should not hide them. */
  const hasExtras = Boolean(entry?.pricePerLiter || entry?.stationName || entry?.notes);

  const onSubmit = async (values: FuelFormValues) => {
    const parsedLiters = Number(values.liters);
    const parsedTotal = values.totalCost ? Number(values.totalCost) : undefined;
    const parsedPrice = values.pricePerLiter ? Number(values.pricePerLiter) : undefined;

    // Store both sides of the pair, so the spend total is never short just
    // because the driver happened to enter the unit price instead.
    const resolvedTotal =
      parsedTotal ?? (parsedPrice && parsedLiters ? parsedPrice * parsedLiters : undefined);
    const resolvedPrice =
      parsedPrice ?? (parsedTotal && parsedLiters ? parsedTotal / parsedLiters : undefined);

    const draft = {
      vehicleId,
      date: values.date,
      odometer: Number(values.odometer),
      liters: parsedLiters,
      pricePerLiter: resolvedPrice,
      totalCost: resolvedTotal,
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
          suffix={<Text variant="labelSm" color="textMuted" tx="units.liter" />}
        />
        <FormInput
          control={control}
          name="totalCost"
          labelTx="fuel.totalCost"
          keyboardType="decimal-pad"
          rules={OPTIONAL_NUMBER_RULES}
          containerStyle={{ flex: 1 }}
          suffix={
            <Text variant="labelSm" color="textMuted">
              EGP
            </Text>
          }
        />
      </View>

      {/* Reads back the half the driver did not type, as a sanity check. */}
      {!!derived && (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.surfaceAlt,
            borderRadius: RADIUS.md,
            columnGap: SPACING.sm,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
          }}
        >
          <Text variant="caption" color="textSecondary" tx={derived.labelTx} />
          <Text variant="labelSm" color="primary">
            {derived.value}
          </Text>
        </View>
      )}

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

      <Collapsible
        titleTx="fuel.moreDetails"
        subtitleTx="fuel.moreDetailsHint"
        icon="plus-circle"
        defaultOpen={hasExtras}
      >
        <FormInput
          control={control}
          name="pricePerLiter"
          labelTx="fuel.pricePerLiter"
          hintTx="fuel.pricePerLiterHint"
          keyboardType="decimal-pad"
          rules={OPTIONAL_NUMBER_RULES}
        />

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
      </Collapsible>
    </Sheet>
  );
}
