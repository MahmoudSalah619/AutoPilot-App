import React from 'react';
import { View } from 'react-native';
import ModalWrapper from '../modalWrapper';
import GLOBAL_STYLES from '@/constants/GlobalStyles';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';
import { Input } from '@/components/atoms';

export default function UpdateKiloModal({
  isVisible,
  setVisible,
  onSubmit,
}: {
  isVisible: boolean;
  setVisible: (value: boolean) => void;
  onSubmit: () => void;
}) {
  const handleClose = () => {
    setVisible(false);
  };
  return (
    <ModalWrapper isVisible={isVisible} setVisible={setVisible}>
      <View>
        <View style={[GLOBAL_STYLES.vhCentering, GLOBAL_STYLES.gap16]}>
          <Text color="black" size={18} weight={700}>
            Update Kilometers
          </Text>
          <Text color="grey70" size={14}>
            Enter the current kilometers from your vehicle's odometer.
          </Text>
          <View style={{ width: '100%' }}>
            <Input placeholder="e.g., 15000" keyboardType="numeric" />
          </View>
        </View>
        <View style={[GLOBAL_STYLES.rowJustifyBetween, GLOBAL_STYLES.gap8, { marginTop: 16 }]}>
          <Button title="Confirm" isFullWidth onPress={onSubmit} />
          <Button title="Cancel" isFullWidth variant="outlined" onPress={handleClose} />
        </View>
      </View>
    </ModalWrapper>
  );
}
