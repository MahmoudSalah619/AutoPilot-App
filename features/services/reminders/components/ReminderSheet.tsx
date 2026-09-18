import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { SPACING } from '@/constants/Layout';
import { useCreateReminderMutation, useUpdateReminderMutation } from '@/apis/autopilotApi';
import type { ReminderTrigger, ServiceReminder, ServiceTypeKey } from '@/@types/models';
import { DEFAULT_SERVICE_INTERVALS } from '@/utils/domain';
import { Sheet } from '@/shared/components/layout';
import { Button, DateField, FormInput, OptionGroup, Text } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { OPTIONAL_NUMBER_RULES } from '@/features/auth/validation';
import { formatDistance } from '@/utils/format';

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

const TRIGGER_OPTIONS: { value: ReminderTrigger; labelTx: string }[] = [
  { value: 'date', labelTx: 'reminders.triggerDate' },
  { value: 'distance', labelTx: 'reminders.triggerDistance' },
  { value: 'both', labelTx: 'reminders.triggerBoth' },
];

interface ReminderFormValues {
  title: string;
  serviceType: ServiceTypeKey;
  trigger: ReminderTrigger;
  dueDate: string;
  dueOdometer: string;
  repeatEveryMonths: string;
  repeatEveryKm: string;
  notes: string;
}

export interface ReminderSheetProps {
  isVisible: boolean;
  onClose: () => void;
  vehicleId: string;
  currentOdometer: number;
  reminder?: ServiceReminder;
}

/**
 * Create/edit sheet for a reminder.
 *
 * Picking a service type seeds both the title and the manufacturer-typical
 * intervals, and the due date/odometer are projected forward from today so the
 * common case is a two-tap create.
 */
export default function ReminderSheet({
  isVisible,
  onClose,
  vehicleId,
  currentOdometer,
  reminder,
}: ReminderSheetProps) {
  const { t } = useTranslation();
  const [createReminder, { isLoading: isCreating }] = useCreateReminderMutation();
  const [updateReminder, { isLoading: isUpdating }] = useUpdateReminderMutation();

  const isEditing = Boolean(reminder);

  const { control, handleSubmit, reset, watch, setValue } = useForm<ReminderFormValues>({
    defaultValues: {
      title: '',
      serviceType: 'oilChange',
      trigger: 'both',
      dueDate: dayjs().add(6, 'month').toISOString(),
      dueOdometer: '',
      repeatEveryMonths: '',
      repeatEveryKm: '',
      notes: '',
    },
  });

  const serviceType = watch('serviceType');
  const trigger = watch('trigger');

  useEffect(() => {
    if (!isVisible) return;

    reset({
      title: reminder?.title ?? '',
      serviceType: reminder?.serviceType ?? 'oilChange',
      trigger: reminder?.trigger ?? 'both',
      dueDate: reminder?.dueDate ?? dayjs().add(6, 'month').toISOString(),
      dueOdometer: reminder?.dueOdometer != null ? String(reminder.dueOdometer) : '',
      repeatEveryMonths:
        reminder?.repeatEveryMonths != null ? String(reminder.repeatEveryMonths) : '',
      repeatEveryKm: reminder?.repeatEveryKm != null ? String(reminder.repeatEveryKm) : '',
      notes: reminder?.notes ?? '',
    });
  }, [isVisible, reminder, reset]);

  // Seed title, intervals and projected due points from the chosen service.
  useEffect(() => {
    if (isEditing || !isVisible) return;

    const defaults = DEFAULT_SERVICE_INTERVALS[serviceType];

    setValue('title', t(`serviceTypes.${serviceType}`));
    setValue('repeatEveryKm', defaults.km ? String(defaults.km) : '');
    setValue('repeatEveryMonths', defaults.months ? String(defaults.months) : '');

    if (defaults.km) {
      setValue('dueOdometer', String(currentOdometer + defaults.km));
    }

    if (defaults.months) {
      setValue('dueDate', dayjs().add(defaults.months, 'month').toISOString());
    }
  }, [serviceType, isEditing, isVisible, currentOdometer, setValue, t]);

  const onSubmit = async (values: ReminderFormValues) => {
    const draft = {
      vehicleId,
      title: values.title.trim() || t(`serviceTypes.${values.serviceType}`),
      serviceType: values.serviceType,
      trigger: values.trigger,
      dueDate: values.trigger !== 'distance' ? values.dueDate : undefined,
      dueOdometer:
        values.trigger !== 'date' && values.dueOdometer ? Number(values.dueOdometer) : undefined,
      repeatEveryMonths: values.repeatEveryMonths ? Number(values.repeatEveryMonths) : undefined,
      repeatEveryKm: values.repeatEveryKm ? Number(values.repeatEveryKm) : undefined,
      notes: values.notes.trim() || undefined,
    };

    try {
      if (reminder) {
        await updateReminder({ id: reminder.id, patch: draft }).unwrap();
      } else {
        await createReminder(draft).unwrap();
      }

      toast.success(t(reminder ? 'reminders.editTitle' : 'reminders.addTitle'));
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
      titleTx={reminder ? 'reminders.editTitle' : 'reminders.addTitle'}
      subtitleTx={reminder ? undefined : 'reminders.addSubtitle'}
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

      <FormInput
        control={control}
        name="title"
        labelTx="reminders.reminderTitle"
        placeholderTx="reminders.reminderTitlePlaceholder"
        required
      />

      <Controller
        control={control}
        name="trigger"
        render={({ field: { onChange, value } }) => (
          <OptionGroup
            labelTx="reminders.trigger"
            options={TRIGGER_OPTIONS}
            value={value}
            onChange={onChange}
            required
          />
        )}
      />

      {trigger !== 'distance' && (
        <Controller
          control={control}
          name="dueDate"
          render={({ field: { onChange, value } }) => (
            <DateField
              labelTx="reminders.dueDate"
              value={value}
              onChange={onChange}
              minDate={dayjs().toISOString()}
              required
            />
          )}
        />
      )}

      {trigger !== 'date' && (
        <FormInput
          control={control}
          name="dueOdometer"
          labelTx="reminders.dueOdometer"
          hint={t('reminders.dueOdometerHint', { odometer: formatDistance(currentOdometer) })}
          keyboardType="number-pad"
          rules={OPTIONAL_NUMBER_RULES}
          suffix={<Text variant="labelSm" color="textMuted" tx="units.km" />}
        />
      )}

      <View style={{ rowGap: SPACING.sm }}>
        <Text variant="label" color="textSecondary" tx="reminders.repeat" />

        <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
          <FormInput
            control={control}
            name="repeatEveryMonths"
            labelTx="reminders.repeatMonths"
            keyboardType="number-pad"
            rules={OPTIONAL_NUMBER_RULES}
            containerStyle={{ flex: 1 }}
          />
          <FormInput
            control={control}
            name="repeatEveryKm"
            labelTx="reminders.repeatKm"
            keyboardType="number-pad"
            rules={OPTIONAL_NUMBER_RULES}
            containerStyle={{ flex: 1 }}
          />
        </View>

        <Text variant="caption" color="textMuted" tx="reminders.repeatHint" />
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
