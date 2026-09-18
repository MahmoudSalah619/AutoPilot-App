import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import dayjs from 'dayjs';

import { SPACING } from '@/constants/Layout';
import { Sheet } from '@/shared/components/layout';
import { Button, Chip, DateField, Text } from '@/shared/components/ui';

export interface DateRange {
  from?: string;
  to?: string;
}

export interface DateRangeSheetProps {
  isVisible: boolean;
  onClose: () => void;
  value: DateRange;
  onApply: (range: DateRange) => void;
  titleTx?: string;
}

/** Common ranges, so the usual case is one tap rather than two date pickers. */
const PRESETS = [
  { key: '30d', labelTx: 'fuel.filter.last30Days', months: 0, days: 30 },
  { key: '3m', labelTx: 'fuel.filter.last3Months', months: 3, days: 0 },
  { key: '6m', labelTx: 'fuel.filter.last6Months', months: 6, days: 0 },
  { key: '1y', labelTx: 'fuel.filter.lastYear', months: 12, days: 0 },
];

/** Date-range filter used by the fuel log and other dated lists. */
export default function DateRangeSheet({
  isVisible,
  onClose,
  value,
  onApply,
  titleTx = 'fuel.filter.title',
}: DateRangeSheetProps) {
  const [draft, setDraft] = useState<DateRange>(value);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      setDraft(value);
      setActivePreset(null);
    }
  }, [isVisible, value]);

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    const from = preset.months
      ? dayjs().subtract(preset.months, 'month')
      : dayjs().subtract(preset.days, 'day');

    setDraft({ from: from.toISOString(), to: dayjs().toISOString() });
    setActivePreset(preset.key);
  };

  return (
    <Sheet
      isVisible={isVisible}
      onClose={onClose}
      titleTx={titleTx}
      footer={
        <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
          <Button
            variant="outline"
            tx="common.reset"
            onPress={() => {
              onApply({});
              onClose();
            }}
            style={{ flex: 1 }}
          />
          <Button
            tx="common.apply"
            onPress={() => {
              onApply(draft);
              onClose();
            }}
            style={{ flex: 1.4 }}
          />
        </View>
      }
    >
      <View style={{ rowGap: SPACING.sm }}>
        <Text variant="label" color="textSecondary" tx="fuel.filter.dateRange" />

        <View
          style={{
            columnGap: SPACING.sm,
            flexDirection: 'row',
            flexWrap: 'wrap',
            rowGap: SPACING.sm,
          }}
        >
          {PRESETS.map((preset) => (
            <Chip
              key={preset.key}
              tx={preset.labelTx}
              selected={activePreset === preset.key}
              onPress={() => applyPreset(preset)}
            />
          ))}
        </View>
      </View>

      <DateField
        labelTx="fuel.filter.from"
        value={draft.from}
        onChange={(from) => {
          setDraft((current) => ({ ...current, from: from || undefined }));
          setActivePreset(null);
        }}
        maxDate={draft.to ?? dayjs().toISOString()}
        clearable
      />

      <DateField
        labelTx="fuel.filter.to"
        value={draft.to}
        onChange={(to) => {
          setDraft((current) => ({ ...current, to: to || undefined }));
          setActivePreset(null);
        }}
        minDate={draft.from}
        maxDate={dayjs().toISOString()}
        clearable
      />
    </Sheet>
  );
}
