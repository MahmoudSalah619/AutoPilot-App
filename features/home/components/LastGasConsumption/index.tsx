import { Text } from '@/shared/components/ui';
import { CardWrapper } from '@/shared/components/ui';
import React from 'react';
import { View } from 'react-native';

export default function LastGasConsumption() {
  return (
    <CardWrapper>
      <View>
        <Text size={18} weight={800}>
          Your Last Gas Consumption
        </Text>
      </View>
    </CardWrapper>
  );
}
