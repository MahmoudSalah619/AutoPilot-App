import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList, Pressable } from 'react-native';
import Modal from 'react-native-modal';
import { useForm, Controller } from 'react-hook-form';
import Feather from '@expo/vector-icons/Feather';
import { Text, Button } from '@/shared/components/ui';
import { FormInput as ControllableInput } from '@/shared/components/ui';
import { COLORS } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AddReminderFormData, ServiceReminderEntry } from '@/@types/serviceReminder';
import { TypeItem } from '@/apis/@types/serviceTypes';

interface AddServiceReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (entry: ServiceReminderEntry) => void;
  serviceTypes: TypeItem[];
  isLoading?: boolean;
}

const AddServiceReminderModal: React.FC<AddServiceReminderModalProps> = ({
  visible,
  onClose,
  onAdd,
  serviceTypes,
  isLoading = false,
}) => {
  const [showServicePicker, setShowServicePicker] = useState(false);
  
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddReminderFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      service: '',
      notes: '',
    },
  });

  const selectedService = watch('service');
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

            {/* Service Type Picker */}
            <View style={styles.inputGroup}>
              <Text size={16} weight={600} style={styles.label} autoTranslate={false}>
                Service Type
              </Text>
              <Controller
                control={control}
                name="service"
                rules={{
                  required: 'Service type is required',
                }}
                render={({ field: { value } }) => (
                  <TouchableOpacity
                    style={[
                      styles.servicePickerButton,
                      errors.service && styles.servicePickerError,
                    ]}
                    onPress={() => setShowServicePicker(true)}
                    disabled={isLoading || serviceTypes.length === 0}
                  >
                    <Text
                      size={16}
                      color={value ? 'text' : 'grey70'}
                      autoTranslate={false}
                    >
                      {value || 'Select a service type'}
                    </Text>
                    <Feather name="chevron-down" size={20} color={textColor} />
                  </TouchableOpacity>
                )}
              />
              {errors.service && (
                <Text size={12} color="danger" autoTranslate={false}>
                  {errors.service.message}
                </Text>
              )}
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
          <Button 
            title="Add" 
            variant="filled" 
            onPress={handleSubmit(onSubmit)} 
            isFullWidth 
            disabled={isLoading}
          />
        </View>
      </View>

      {/* Service Type Picker Modal */}
      <Modal
        isVisible={showServicePicker}
        onBackdropPress={() => setShowServicePicker(false)}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriverForBackdrop
      >
        <View style={[styles.pickerContainer, { backgroundColor }]}>
          <View style={styles.pickerHeader}>
            <Text size={18} weight={700} autoTranslate={false}>
              Select Service Type
            </Text>
            <TouchableOpacity onPress={() => setShowServicePicker(false)}>
              <Feather name="x" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={serviceTypes}
            keyExtractor={(item) => item.serviceTypeId}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.serviceOption,
                  selectedService === item.name && styles.selectedServiceOption,
                ]}
                onPress={() => {
                  setValue('service', item.name);
                  setShowServicePicker(false);
                }}
              >
                <Text
                  size={16}
                  weight={selectedService === item.name ? 600 : 400}
                  color={selectedService === item.name ? 'primary' : 'text'}
                  autoTranslate={false}
                >
                  {item.name}
                </Text>
                {selectedService === item.name && (
                  <Feather name="check" size={20} color={COLORS.light.primary} />
                )}
              </Pressable>
            )}
            style={styles.serviceList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
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
  servicePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.light.greyE5,
    borderRadius: 8,
    backgroundColor: COLORS.light.background,
  },
  servicePickerError: {
    borderColor: COLORS.light.danger,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 20,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.greyF5,
  },
  serviceList: {
    maxHeight: 280,
  },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.greyF5,
  },
  selectedServiceOption: {
    backgroundColor: COLORS.light.primary + '10',
  },
});

export default AddServiceReminderModal;