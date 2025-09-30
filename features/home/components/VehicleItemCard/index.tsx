import { Input, Text } from '@/shared/components/ui';
import React from 'react';
import { View } from 'react-native';

export default function VehicleItemCard({
  placeHolder,
  onChange,
  defaultValue,
  disabled,
}: {
  placeHolder?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean | undefined;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ marginBottom: 6 }}>{placeHolder || 'VehicleItemCard'}</Text>
      <Input
        defaultValue={defaultValue}
        placeholder={placeHolder}
        onChangeText={onChange}
        editable={!disabled}
      />
    </View>
  );
}
