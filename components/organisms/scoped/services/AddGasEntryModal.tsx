import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { useForm } from 'react-hook-form';
import Feather from '@expo/vector-icons/Feather';
import { Text, Button } from '@/components/atoms';
import ControllableInput from '@/components/molecules/common/FormInput';
import { COLORS } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AddEntryFormData, GasConsumptionEntry } from '@/app/(main)/services/gas-consumption/types';
import useGetUserInfo from '@/utils/getUserInfo';

interface AddGasEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (entry: AddEntryFormData) => void;
  lastEntry?: GasConsumptionEntry;
}

const AddGasEntryModal: React.FC<AddGasEntryModalProps> = ({
  visible,
  onClose,
  onAdd,
  lastEntry,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddEntryFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      kilometersDriven: 0,
      litersConsumed: 45.0,
    },
  });

  const { vehicle } = useGetUserInfo();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Watch form values for preview calculation
  const watchedValues = watch();

  const onSubmit = (data: AddEntryFormData) => {
    onAdd(data);
    handleClose();
  };

  const handleClose = () => {
    reset({
      date: new Date().toISOString().split('T')[0],
      kilometersDriven: 0,
      litersConsumed: 45.0,
    });
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      backdropOpacity={0.5}
      animationIn="fadeIn"
      animationOut="fadeOut"
      useNativeDriverForBackdrop
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={24} color={textColor} />
          </TouchableOpacity>
          <Text size={18} weight={700} style={styles.headerTitle} autoTranslate={false}>
            Add Fuel Entry
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.formCard}>
            {/* Date Input */}
            <View style={styles.inputGroup}>
              <Text size={16} weight={600} style={styles.label} autoTranslate={false}>
                Date
              </Text>
              <ControllableInput
                control={control as any}
                name="date"
                placeholder="YYYY-MM-DD"
                keyboardType="default"
                rules={{
                  required: 'Date is required',
                }}
              />
            </View>

            {/* Distance Driven Input */}
            <View style={styles.inputGroup}>
              <Text size={16} weight={600} style={styles.label} autoTranslate={false}>
                Distance Driven (km)
              </Text>
              {lastEntry && (
                <Text size={12} color="grey70" style={styles.hintText} autoTranslate={false}>
                  Last trip: {lastEntry.kilometersDriven?.toLocaleString() || 'N/A'} km
                </Text>
              )}
              <ControllableInput
                control={control as any}
                name="kilometersDriven"
                placeholder="500"
                keyboardType="numeric"
                rules={{
                  required: 'Distance driven is required',
                  min: {
                    value: 1,
                    message: 'Distance must be greater than 0',
                  },
                  setValueAs: (value: string) => parseInt(value) || 0,
                }}
              />
            </View>

            {/* Fuel Amount Input */}
            <View style={styles.inputGroup}>
              <Text size={16} weight={600} style={styles.label} autoTranslate={false}>
                Fuel Consumed (Liters)
              </Text>
              <ControllableInput
                control={control as any}
                name="litersConsumed"
                placeholder="45.0"
                keyboardType="numeric"
                rules={{
                  required: 'Valid fuel amount is required',
                  min: {
                    value: 0.1,
                    message: 'Fuel amount must be greater than 0',
                  },
                  setValueAs: (value: string) => parseFloat(value) || 0,
                }}
              />
            </View>

            {/* Preview Calculation */}
            {watchedValues.kilometersDriven > 0 && watchedValues.litersConsumed > 0 && (
              <View style={styles.previewContainer}>
                <Text size={14} weight={600} color="grey70" autoTranslate={false}>
                  Preview Calculation:
                </Text>
                <View style={styles.previewRow}>
                  <Text size={12} color="grey70" autoTranslate={false}>
                    Distance driven:
                  </Text>
                  <Text size={12} weight={600} autoTranslate={false}>
                    {watchedValues.kilometersDriven.toLocaleString()} km
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text size={12} color="grey70" autoTranslate={false}>
                    Estimated efficiency:
                  </Text>
                  <Text size={12} weight={600} color="primary" autoTranslate={false}>
                    {(watchedValues.kilometersDriven / watchedValues.litersConsumed).toFixed(1)} KM/L
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <Button title="Cancel" variant="outlined" onPress={handleClose} isFullWidth />
          <View style={styles.buttonSpacer} />
          <Button title="Add Entry" variant="filled" onPress={handleSubmit(onSubmit)} isFullWidth />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 20,
    // maxHeight: '80%',
    minHeight: 400,
    paddingVertical: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.greyF5,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    // paddingHorizontal: 16,
  },
  formCard: {
    padding: 20,
    // marginVertical: 16,
    backgroundColor: 'transparent',
  },
  inputGroup: {
    // marginBottom: 20,
    gap: 8,
  },
  label: {
    // marginBottom: 4,
  },
  hintText: {
    marginBottom: 4,
    fontSize: 12,
  },
  errorText: {
    marginTop: 4,
  },
  previewContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.light.greyF5,
    borderRadius: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.greyF5,
  },
  buttonSpacer: {
    width: 12,
  },
});

export default AddGasEntryModal;
