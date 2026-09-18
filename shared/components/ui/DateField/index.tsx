import React, { useMemo, useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Calendar, type DateData } from 'react-native-calendars';
import dayjs from 'dayjs';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { useCalendarTheme } from '@/shared/components/ui/DateField/useCalendarTheme';
import Button from '@/shared/components/ui/Button';
import Sheet from '@/shared/components/layout/Sheet';
import Text from '@/shared/components/ui/Text';
import { formatDate } from '@/utils/format';

export interface DateFieldProps {
  /** ISO date string, or empty for no selection. */
  value?: string;
  onChange: (isoDate: string) => void;
  labelTx?: string;
  placeholderTx?: string;
  hintTx?: string;
  error?: string;
  required?: boolean;
  /** Earliest selectable date, ISO. */
  minDate?: string;
  /** Latest selectable date, ISO. */
  maxDate?: string;
  /** Adds a clear affordance for optional dates. */
  clearable?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Date picker built on the calendar the app already ships.
 *
 * Replaces the free-text `YYYY-MM-DD` inputs the forms used to rely on, which
 * put the burden of formatting on the user and failed silently on a typo.
 */
export default function DateField({
  value,
  onChange,
  labelTx,
  placeholderTx = 'common.date',
  hintTx,
  error,
  required = false,
  minDate,
  maxDate,
  clearable = false,
  disabled = false,
  style,
}: DateFieldProps) {
  const { colors } = useTheme();
  const calendarTheme = useCalendarTheme();
  const [isOpen, setIsOpen] = useState(false);

  /** react-native-calendars keys on `YYYY-MM-DD`, not full timestamps. */
  const dayKey = value ? dayjs(value).format('YYYY-MM-DD') : undefined;

  const markedDates = useMemo(
    () => (dayKey ? { [dayKey]: { selected: true, selectedColor: colors.primary } } : undefined),
    [dayKey, colors.primary]
  );

  const handleSelect = (isoDay: string) => {
    onChange(dayjs(isoDay).toISOString());
    setIsOpen(false);
  };

  return (
    <View style={[{ rowGap: SPACING.xs, width: '100%' }, style]}>
      {!!labelTx && (
        <View style={{ flexDirection: 'row' }}>
          <Text variant="label" color="textSecondary" tx={labelTx} />
          {required ? (
            <Text variant="label" color="danger">
              {' *'}
            </Text>
          ) : null}
        </View>
      )}

      <Pressable
        onPress={() => setIsOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={value ? formatDate(value) : undefined}
        style={({ pressed }) => [
          {
            alignItems: 'center',
            backgroundColor: disabled ? colors.surfaceAlt : colors.surface,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            columnGap: SPACING.sm,
            flexDirection: 'row',
            minHeight: 48,
            paddingHorizontal: SPACING.md,
          },
          pressed && { opacity: 0.7 },
          disabled && { opacity: 0.6 },
        ]}
      >
        <Feather name="calendar" size={18} color={colors.textMuted} />

        {value ? (
          <Text variant="body" style={{ flex: 1 }}>
            {formatDate(value)}
          </Text>
        ) : (
          <Text variant="body" color="textDisabled" tx={placeholderTx} style={{ flex: 1 }} />
        )}

        {clearable && !!value ? (
          <Pressable
            onPress={() => onChange('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="common.clear"
          >
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </Pressable>

      {(!!error || !!hintTx) && (
        <Text
          variant="caption"
          color={error ? 'danger' : 'textMuted'}
          tx={error ? undefined : hintTx}
        >
          {error}
        </Text>
      )}

      <Sheet
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
        titleTx={labelTx ?? 'common.date'}
        footer={
          <Button variant="outline" tx="common.cancel" fullWidth onPress={() => setIsOpen(false)} />
        }
      >
        <Calendar
          current={dayKey}
          minDate={minDate ? dayjs(minDate).format('YYYY-MM-DD') : undefined}
          maxDate={maxDate ? dayjs(maxDate).format('YYYY-MM-DD') : undefined}
          markedDates={markedDates}
          onDayPress={(day: DateData) => handleSelect(day.dateString)}
          enableSwipeMonths
          theme={calendarTheme}
        />
      </Sheet>
    </View>
  );
}
