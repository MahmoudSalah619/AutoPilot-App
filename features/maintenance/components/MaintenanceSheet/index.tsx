import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { SPACING } from '@/constants/Layout';
import { useCreateMaintenanceMutation, useUpdateMaintenanceMutation } from '@/apis/autopilotApi';
import type { MaintenanceRecord, ServiceTypeKey } from '@/@types/models';
import { DEFAULT_SERVICE_INTERVALS } from '@/utils/domain';
import { Sheet } from '@/shared/components/layout';
import { Button, DateField, FormInput, OptionGroup, Switch, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { OPTIONAL_NUMBER_RULES } from '@/features/auth/validation';

const SERVICE_TYPES: ServiceTypeKey[] = [
  'oilChange',
  'tireRotation',
  'brakeService',
  'airFilter',
  'cabinFilter',
  'sparkPlugs',
  'batteryService',
  'coolantFlush',
  'transmissionService',
  'wheelAlignment',
  'acService',
  'generalInspection',
  'other',
];

const SERVICE_OPTIONS = SERVICE_TYPES.map((value) => ({
  value,
  labelTx: `serviceTypes.${value}`,
}));

interface MaintenanceFormValues {
  serviceType: ServiceTypeKey;
  customTitle: string;
  date: string;
  odometer: string;
  cost: string;
  workshop: string;
  intervalKm: string;
  intervalMonths: string;
  notes: string;
  isCompleted: boolean;
}

export interface MaintenanceSheetProps {
  isVisible: boolean;
  onClose: () => void;
  vehicleId: string;
  /** Current odometer, used to pre-fill the reading for a completed service. */
  currentOdometer?: number;
  /** Existing record when editing. */
  record?: MaintenanceRecord;
}

/** Create/edit sheet for a service record. */
export default function MaintenanceSheet({
  isVisible,
  onClose,
  vehicleId,
  currentOdometer,
  record,
}: MaintenanceSheetProps) {
  const { t } = useTranslation();
  const [createMaintenance, { isLoading: isCreating }] = useCreateMaintenanceMutation();
  const [updateMaintenance, { isLoading: isUpdating }] = useUpdateMaintenanceMutation();

  const isEditing = Boolean(record);

  const { control, handleSubmit, reset, watch, setValue } = useForm<MaintenanceFormValues>({
    defaultValues: {
      serviceType: 'oilChange',
      customTitle: '',
      date: dayjs().toISOString(),
      odometer: '',
      cost: '',
      workshop: '',
      intervalKm: '',
      intervalMonths: '',
      notes: '',
      isCompleted: true,
    },
  });

  const serviceType = watch('serviceType');
  const isCompleted = watch('isCompleted');

  // Re-seed the form whenever the sheet opens, so a stale draft never leaks
  // from a previous edit into a new record.
  useEffect(() => {
    if (!isVisible) return;

    reset({
      serviceType: record?.serviceType ?? 'oilChange',
      customTitle: record?.customTitle ?? '',
      date: record?.date ?? dayjs().toISOString(),
      odometer: record?.odometer != null ? String(record.odometer) : String(currentOdometer ?? ''),
      cost: record?.cost != null ? String(record.cost) : '',
      workshop: record?.workshop ?? '',
      intervalKm: record?.intervalKm != null ? String(record.intervalKm) : '',
      intervalMonths: record?.intervalMonths != null ? String(record.intervalMonths) : '',
      notes: record?.notes ?? '',
      isCompleted: record ? record.status === 'completed' : true,
    });
  }, [isVisible, record, currentOdometer, reset]);

  // Pre-fill the manufacturer-typical interval when the service type changes,
  // so the common case needs no typing at all.
  useEffect(() => {
    if (isEditing) return;

    const defaults = DEFAULT_SERVICE_INTERVALS[serviceType];
    setValue('intervalKm', defaults.km ? String(defaults.km) : '');
    setValue('intervalMonths', defaults.months ? String(defaults.months) : '');
  }, [serviceType, isEditing, setValue]);

  const onSubmit = async (values: MaintenanceFormValues) => {
    const draft = {
      vehicleId,
      serviceType: values.serviceType,
      customTitle: values.customTitle.trim() || undefined,
      date: values.date,
      odometer: values.odometer ? Number(values.odometer) : undefined,
      cost: values.cost ? Number(values.cost) : undefined,
      currency: 'EGP' as const,
      workshop: values.workshop.trim() || undefined,
      intervalKm: values.intervalKm ? Number(values.intervalKm) : undefined,
      intervalMonths: values.intervalMonths ? Number(values.intervalMonths) : undefined,
      notes: values.notes.trim() || undefined,
      isCompleted: values.isCompleted,
    };

    try {
      if (record) {
        await updateMaintenance({ id: record.id, patch: draft }).unwrap();
      } else {
        await createMaintenance(draft).unwrap();
      }

      toast.success(t(record ? 'maintenance.editTitle' : 'maintenance.addTitle'));
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
      titleTx={record ? 'maintenance.editTitle' : 'maintenance.addTitle'}
      subtitleTx={record ? undefined : 'maintenance.addSubtitle'}
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
        name="serviceType"
        render={({ field: { onChange, value } }) => (
          <OptionGroup
            labelTx="maintenance.serviceType"
            options={SERVICE_OPTIONS}
            value={value}
            onChange={onChange}
            required
          />
        )}
      />

      {serviceType === 'other' && (
        <FormInput
          control={control}
          name="customTitle"
          labelTx="maintenance.customTitle"
          placeholderTx="maintenance.customTitlePlaceholder"
          required
        />
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
          <Text variant="label" tx="maintenance.markCompleted" />
          <Text variant="caption" color="textMuted" tx="maintenance.markCompletedHint" />
        </View>

        <Controller
          control={control}
          name="isCompleted"
          render={({ field: { onChange, value } }) => (
            <Switch value={value} onValueChange={onChange} />
          )}
        />
      </View>

      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, value } }) => (
          <DateField
            labelTx="common.date"
            value={value}
            onChange={onChange}
            maxDate={isCompleted ? dayjs().toISOString() : undefined}
            minDate={isCompleted ? undefined : dayjs().toISOString()}
            required
          />
        )}
      />

      <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
        <FormInput
          control={control}
          name="odometer"
          labelTx="maintenance.odometerAtService"
          keyboardType="number-pad"
          rules={OPTIONAL_NUMBER_RULES}
          containerStyle={{ flex: 1 }}
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
        name="workshop"
        labelTx="maintenance.workshop"
        placeholderTx="maintenance.workshopPlaceholder"
      />

      <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
        <FormInput
          control={control}
          name="intervalKm"
          labelTx="maintenance.intervalKm"
          keyboardType="number-pad"
          rules={OPTIONAL_NUMBER_RULES}
          containerStyle={{ flex: 1 }}
        />
        <FormInput
          control={control}
          name="intervalMonths"
          labelTx="maintenance.intervalMonths"
          keyboardType="number-pad"
          rules={OPTIONAL_NUMBER_RULES}
          containerStyle={{ flex: 1 }}
        />
      </View>

      <Text variant="caption" color="textMuted" tx="maintenance.intervalHint" />

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
