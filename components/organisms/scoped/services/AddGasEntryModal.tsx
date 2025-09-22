import React, { useState } from 'react';
import { View, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import Feather from '@expo/vector-icons/Feather';
import { Text, Input, Button } from '@/components/atoms';
import { COLORS } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AddEntryFormData, GasConsumptionEntry } from '@/@types/gasConsumption';

interface AddGasEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (entry: GasConsumptionEntry) => void;
  lastEntry?: GasConsumptionEntry;
}

interface FormErrors {
  date?: string;
  kilometersTotal?: string;
  litersFilled?: string;
}

const AddGasEntryModal: React.FC<AddGasEntryModalProps> = ({
  visible,
  onClose,
  onAdd,
  lastEntry,
}) => {
  const [formData, setFormData] = useState<AddEntryFormData>({
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    kilometersTotal: lastEntry ? lastEntry.kilometersTotal + 100 : 50000, // Default suggestion
    litersFilled: 45.0,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'grey70');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.kilometersTotal || formData.kilometersTotal <= 0) {
      newErrors.kilometersTotal = 'Valid odometer reading is required';
    }

    if (lastEntry && formData.kilometersTotal <= lastEntry.kilometersTotal) {
      newErrors.kilometersTotal = 'Odometer reading must be higher than last entry';
    }

    if (!formData.litersFilled || formData.litersFilled <= 0) {
      newErrors.litersFilled = 'Valid fuel amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) {
      return;
    }

    // Calculate KM/L and distance driven
    let kmPerLiter: number | undefined;
    let kilometersDriven: number | undefined;

    if (lastEntry) {
      kilometersDriven = formData.kilometersTotal - lastEntry.kilometersTotal;
      if (kilometersDriven > 0) {
        kmPerLiter = kilometersDriven / formData.litersFilled;
      }
    }

    const newEntry: GasConsumptionEntry = {
      id: Date.now().toString(),
      date: formData.date,
      kilometersTotal: formData.kilometersTotal,
      litersFilled: formData.litersFilled,
      kmPerLiter,
      kilometersDriven,
    };

    onAdd(newEntry);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      kilometersTotal: lastEntry ? lastEntry.kilometersTotal + 100 : 50000,
      litersFilled: 45.0,
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
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
              <Input
                placeholder="YYYY-MM-DD"
                value={formData.date}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, date: text }))}
                keyboardType="default"
              />
              {errors.date && (
                <Text size={12} color="danger" style={styles.errorText} autoTranslate={false}>
                  {errors.date}
                </Text>
              )}
            </View>

            {/* Odometer Reading Input */}
            <View style={styles.inputGroup}>
              <Text size={16} weight={600} style={styles.label} autoTranslate={false}>
                Odometer Reading (km)
              </Text>
              {lastEntry && (
                <Text size={12} color="grey70" style={styles.hintText} autoTranslate={false}>
                  Last reading: {lastEntry.kilometersTotal.toLocaleString()} km
                </Text>
              )}
              <Input
                placeholder="50000"
                value={formData.kilometersTotal.toString()}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    kilometersTotal: parseInt(text) || 0,
                  }))
                }
                keyboardType="numeric"
              />
              {errors.kilometersTotal && (
                <Text size={12} color="danger" style={styles.errorText} autoTranslate={false}>
                  {errors.kilometersTotal}
                </Text>
              )}
            </View>

            {/* Fuel Amount Input */}
            <View style={styles.inputGroup}>
              <Text size={16} weight={600} style={styles.label} autoTranslate={false}>
                Fuel Filled (Liters)
              </Text>
              <Input
                placeholder="45.0"
                value={formData.litersFilled.toString()}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    litersFilled: parseFloat(text) || 0,
                  }))
                }
                keyboardType="numeric"
              />
              {errors.litersFilled && (
                <Text size={12} color="danger" style={styles.errorText} autoTranslate={false}>
                  {errors.litersFilled}
                </Text>
              )}
            </View>

            {/* Preview Calculation */}
            {lastEntry &&
              formData.kilometersTotal > lastEntry.kilometersTotal &&
              formData.litersFilled > 0 && (
                <View style={styles.previewContainer}>
                  <Text size={14} weight={600} color="grey70" autoTranslate={false}>
                    Preview Calculation:
                  </Text>
                  <View style={styles.previewRow}>
                    <Text size={12} color="grey70" autoTranslate={false}>
                      Distance driven:
                    </Text>
                    <Text size={12} weight={600} autoTranslate={false}>
                      {(formData.kilometersTotal - lastEntry.kilometersTotal).toLocaleString()} km
                    </Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text size={12} color="grey70" autoTranslate={false}>
                      Fuel efficiency:
                    </Text>
                    <Text size={12} weight={600} color="primary" autoTranslate={false}>
                      {(
                        (formData.kilometersTotal - lastEntry.kilometersTotal) /
                        formData.litersFilled
                      ).toFixed(1)}{' '}
                      KM/L
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
          <Button title="Add Entry" variant="filled" onPress={handleAdd} isFullWidth />
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
