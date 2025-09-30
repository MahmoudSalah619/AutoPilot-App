import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import ModalWrapper from '../modalWrapper';
import { Text, Button } from '@/shared/components/ui';
import GLOBAL_STYLES from '@/constants/GlobalStyles';
import { FilterModalProps, FilterType, DateFilterType, FilterState } from './types';
import styles from './styles';

export default function FilterModal({
  isVisible,
  setVisible,
  filters,
  onApplyFilters,
}: FilterModalProps) {
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  useEffect(() => {
    if (isVisible) {
      setTempFilters(filters);
    }
  }, [isVisible, filters]);

  const statusOptions: { value: FilterType; label: string }[] = [
    { value: 'All', label: 'All' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Upcoming', label: 'Upcoming' },
  ];

  const dateOptions: { value: DateFilterType; label: string }[] = [
    { value: 'All', label: 'All Time' },
    { value: 'LastMonth', label: 'Last Month' },
    { value: 'Last3Months', label: 'Last 3 Months' },
    { value: 'Last6Months', label: 'Last 6 Months' },
    { value: 'LastYear', label: 'Last Year' },
    { value: 'Custom', label: 'Custom Range' },
  ];

  const handleApplyFilters = () => {
    onApplyFilters(tempFilters);
    setVisible(false);
  };

  const handleResetFilters = () => {
    const resetState: FilterState = {
      status: 'All',
      dateRange: 'All',
    };
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
          Filter Maintenance
        </Text>

        {/* Status Filter Section */}
        <View style={styles.filterSection}>
          <Text size={16} weight={600} style={styles.sectionTitle}>
            Status
          </Text>
          <View style={styles.optionsContainer}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  tempFilters.status === option.value && styles.activeOptionButton,
                ]}
                onPress={() => setTempFilters((prev) => ({ ...prev, status: option.value }))}
              >
                <Text
                  size={14}
                  weight={500}
                  color={tempFilters.status === option.value ? 'white' : 'grey70'}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Range Filter Section */}
        <View style={styles.filterSection}>
          <Text size={16} weight={600} style={styles.sectionTitle}>
            Date Range
          </Text>
          <View style={styles.dateOptionsContainer}>
            {dateOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  tempFilters.dateRange === option.value && styles.activeOptionButton,
                ]}
                onPress={() => setTempFilters((prev) => ({ ...prev, dateRange: option.value }))}
              >
                <Text
                  size={14}
                  weight={500}
                  color={tempFilters.dateRange === option.value ? 'white' : 'grey70'}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button title="Apply Filters" onPress={handleApplyFilters} />
          <Button title="Reset Filters" variant="outlined" onPress={handleResetFilters} />
          <Button title="Cancel" variant="outlined" onPress={handleClose} />
        </View>
      </View>
    </ModalWrapper>
  );
}
