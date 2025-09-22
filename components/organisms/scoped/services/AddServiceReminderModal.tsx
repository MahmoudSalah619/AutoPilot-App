import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { useForm } from 'react-hook-form';
import Feather from '@expo/vector-icons/Feather';
import { Text, Button } from '@/components/atoms';
import ControllableInput from '@/components/molecules/common/FormInput';
import { COLORS } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AddReminderFormData, ServiceReminderEntry } from '@/@types/serviceReminder';

interface AddServiceReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (entry: ServiceReminderEntry) => void;
}

const AddServiceReminderModal: React.FC<AddServiceReminderModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddReminderFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      service: '',
      notes: '',
    },
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const onSubmit = (data: AddReminderFormData) => {
    const newEntry: ServiceReminderEntry = {
      id: Date.now().toString(),
      date: data.date,
      service: data.service,
      notes: data.notes,
      status: new Date(data.date) > new Date() ? 'upcoming' : 'completed',
      createdAt: new Date().toISOString(),
    };

    onAdd(newEntry);
    handleClose();
  };

  const handleClose = () => {
    reset({
      date: new Date().toISOString().split('T')[0],
      service: '',
      notes: '',
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
            Add Service Reminder
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.formCard}>
            {/* Date Input */}
            <View style={styles.inputGroup}>
              <Text size={16} weight={600} style={styles.label} autoTranslate={false}>
                Service Date
              </Text>
              <ControllableInput
                control={control as any}
                name="date"
                placeholder="YYYY-MM-DD"
                keyboardType="default"
                rules={{
                  required: 'Service date is required',
                }}
              />
            </View>

            {/* Service Type Input */}
            <View style={styles.inputGroup}>
              <Text size={16} weight={600} style={styles.label} autoTranslate={false}>
                Service Type
              </Text>
              <ControllableInput
                control={control as any}
                name="service"
                placeholder="e.g., Oil Change, Tire Rotation, Brake Inspection"
                keyboardType="default"
                rules={{
                  required: 'Service type is required',
                  minLength: {
                    value: 3,
                    message: 'Service type must be at least 3 characters',
                  },
                }}
              />
            </View>

            {/* Notes Input */}
            <View style={styles.inputGroup}>
              <Text size={16} weight={600} style={styles.label} autoTranslate={false}>
                Notes (Optional)
              </Text>
              <ControllableInput
                control={control as any}
                name="notes"
                placeholder="Additional notes or details..."
                isTextAreaInput={true}
                multiline={true}
                numberOfLines={3}
                keyboardType="default"
              />
            </View>
          </View>
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <Button title="Cancel" variant="outlined" onPress={handleClose} isFullWidth />
          <View style={styles.buttonSpacer} />
          <Button title="Add Reminder" variant="filled" onPress={handleSubmit(onSubmit)} isFullWidth />
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
    paddingHorizontal: 16,
  },
  formCard: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  inputGroup: {
    gap: 8,
    marginBottom: 16,
  },
  label: {},
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

export default AddServiceReminderModal;