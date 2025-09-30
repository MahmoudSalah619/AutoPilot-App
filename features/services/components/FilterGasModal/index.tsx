import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ModalWrapper } from '@/shared/components/layout';
import { Text, Button } from '@/shared/components/ui';
import { FormInput as ControllableInput } from '@/shared/components/ui';
import { useForm } from 'react-hook-form';
import styles from './styles';

interface FilterFormData {
  startDate: string;
  endDate: string;
}

interface FilterGasModalProps {
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
  filters: {
    startDate?: string;
    endDate?: string;
  };
  onApplyFilters: (filters: { startDate?: string; endDate?: string }) => void;
}

const FilterGasModal: React.FC<FilterGasModalProps> = ({
  isVisible,
  setVisible,
  filters,
  onApplyFilters,
}) => {
  const [tempFilters, setTempFilters] = useState(filters);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FilterFormData>({
    defaultValues: {
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
    },
  });

  useEffect(() => {
    if (isVisible) {
      setTempFilters(filters);
      setValue('startDate', filters.startDate || '');
      setValue('endDate', filters.endDate || '');
    }
  }, [isVisible, filters, setValue]);

  const handleApplyFilters = (data: FilterFormData) => {
    const newFilters = {
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
    };
    onApplyFilters(newFilters);
    setVisible(false);
  };

  const handleResetFilters = () => {
    const resetState = {};
    setTempFilters(resetState);
    onApplyFilters(resetState);
    setVisible(false);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <ModalWrapper
      isVisible={isVisible}
      setVisible={setVisible}
      height="auto"
      containerStyle={styles.modalContainer}
    >
      <View style={styles.modalContent}>
        <Text size={20} weight={700} style={styles.modalTitle}>
          Filter Fuel Records
        </Text>

        {/* Start Date Filter Section */}
        <View style={styles.filterSection}>
          <Text size={16} weight={600} style={styles.sectionTitle}>
            Start Date
          </Text>
          <ControllableInput
            control={control as any}
            name="startDate"
            placeholder="YYYY-MM-DD (Optional)"
            keyboardType="default"
            rules={{
              pattern: {
                value: /^\d{4}-\d{2}-\d{2}$/,
                message: 'Please enter date in YYYY-MM-DD format',
              },
            }}
          />
          {errors.startDate && (
            <Text size={12} color="danger" style={styles.errorText}>
              {errors.startDate.message}
            </Text>
          )}
        </View>

        {/* End Date Filter Section */}
        <View style={styles.filterSection}>
          <Text size={16} weight={600} style={styles.sectionTitle}>
            End Date
          </Text>
          <ControllableInput
            control={control as any}
            name="endDate"
            placeholder="YYYY-MM-DD (Optional)"
            keyboardType="default"
            rules={{
              pattern: {
                value: /^\d{4}-\d{2}-\d{2}$/,
                message: 'Please enter date in YYYY-MM-DD format',
              },
            }}
          />
          {errors.endDate && (
            <Text size={12} color="danger" style={styles.errorText}>
              {errors.endDate.message}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button title="Apply Filters" onPress={handleSubmit(handleApplyFilters)} />
          <Button title="Reset Filters" variant="outlined" onPress={handleResetFilters} />
          <Button title="Cancel" variant="outlined" onPress={handleClose} />
        </View>
      </View>
    </ModalWrapper>
  );
};



export default FilterGasModal;