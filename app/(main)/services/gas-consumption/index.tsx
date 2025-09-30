import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, Badge } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import { COLORS } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  GasConsumptionEntry,
  GasConsumptionStats,
  AddEntryFormData,
  GasConsumptionResponse,
} from './types';
import AddGasEntryModal from '@/components/organisms/scoped/services/AddGasEntryModal';
import {
  useAddGasConsumptionMutation,
  useDeleteGasConsumptionMutation,
  useGetGasConsumptionQuery,
  useUpdateGasConsumptionMutation,
} from '@/apis/services/services/gasConsumption';
import styles from './styles';
import FilterGasModal from '@/components/organisms/scoped/services/FilterGasModal';

const GasConsumption = () => {
  const [currentFilter, setCurrentFilter] = useState<{ startDate?: string; endDate?: string }>({});
  const {
    data: apiData,
    isLoading: isLoadingData,
    error,
  } = useGetGasConsumptionQuery(Object.keys(currentFilter).length > 0 ? currentFilter : undefined);
  const [addGasConsumption, { isLoading: isAdding }] = useAddGasConsumptionMutation();
  const [updateGasConsumption, { isLoading: isUpdating }] = useUpdateGasConsumptionMutation();
  const [deleteGasConsumption, { isLoading: isDeleting }] = useDeleteGasConsumptionMutation();

  const [showAddModal, setShowAddModal] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<GasConsumptionEntry | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Use API data directly
  const gasData = apiData?.data || [];
  const mutedColor = useThemeColor({}, 'grey70');
  const backgroundColor = useThemeColor({}, 'background');

  // Get statistics from API response (backend-calculated)
  const stats = apiData?.statistics || {
    averageKmPerLiter: 0,
    totalKilometersDriven: 0,
    totalLitersConsumed: 0,
    bestEfficiency: 0,
    worstEfficiency: 0,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getEfficiencyColor = (kmPerLiter: number) => {
    if (kmPerLiter >= 13) return COLORS.light.success;
    if (kmPerLiter >= 11) return COLORS.light.primary;
    return COLORS.light.danger;
  };

  const handleAddEntry = () => {
    setIsEditMode(false);
    setEditingEntry(null);
    setShowAddModal(true);
  };

  const handleEditEntry = (entry: GasConsumptionEntry) => {
    setIsEditMode(true);
    setEditingEntry(entry);
    setShowAddModal(true);
  };

  const handleAddGasEntry = async (entryData: AddEntryFormData) => {
    try {
      // Convert form data to proper types
      const formattedData = {
        date: entryData.date,
        kilometersDriven:
          typeof entryData.kilometersDriven === 'string'
            ? parseInt(entryData.kilometersDriven)
            : entryData.kilometersDriven,
        litersConsumed:
          typeof entryData.litersConsumed === 'string'
            ? parseFloat(entryData.litersConsumed)
            : entryData.litersConsumed,
      };

      if (isEditMode && editingEntry) {
        // Update existing entry - include gasId
        const updateData = { ...formattedData, gasId: editingEntry.gasId };
        const result = await updateGasConsumption(updateData).unwrap();
        Alert.alert('Success', 'Fuel consumption record updated successfully!');
      } else {
        // Add new entry
        const result = await addGasConsumption(formattedData).unwrap();
        Alert.alert('Success', 'Fuel consumption record added successfully!');
      }

      // Reset edit state
      setIsEditMode(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Failed to save gas consumption:', error);
      const action = isEditMode ? 'update' : 'add';
      Alert.alert('Error', `Failed to ${action} fuel consumption record. Please try again.`);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setIsEditMode(false);
    setEditingEntry(null);
  };

  const handleApplyFilter = (filters: { startDate?: string; endDate?: string }) => {
    const newFilter: { startDate?: string; endDate?: string } = {};

    if (filters.startDate && filters.startDate.trim()) {
      newFilter.startDate = filters.startDate;
    }
    if (filters.endDate && filters.endDate.trim()) {
      newFilter.endDate = filters.endDate;
    }

    setCurrentFilter(newFilter);
    console.log('Applied filters:', newFilter);
  };

  const handleResetFilter = () => {
    setCurrentFilter({});
    console.log('Reset filters');
  };

  const getFilterDisplayText = () => {
    const { startDate, endDate } = currentFilter;
    if (startDate && endDate) {
      return `${startDate} to ${endDate}`;
    } else if (startDate) {
      return `From ${startDate}`;
    } else if (endDate) {
      return `Until ${endDate}`;
    }
    return null;
  };

  const handleDeleteEntry = (entry: GasConsumptionEntry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this fuel consumption record? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Find the entry to get the required data for deletion
              console.log('Entry to delete:', entry);

              if (!entry) return;

              const deleteRequest = {
                date: entry.date,
                kilometersDriven: entry.kilometersDriven || 0,
                litersConsumed: entry.litersConsumed,
                gasId: entry.gasId,
              };

              await deleteGasConsumption(deleteRequest).unwrap();

              Alert.alert('Success', 'Fuel consumption record deleted successfully!');
            } catch (error) {
              console.error('Failed to delete gas consumption:', error);
              Alert.alert('Error', 'Failed to delete fuel consumption record. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderGasEntry = ({ item }: { item: any }) => (
    <CardWrapper customStyles={styles.entryCard}>
      <View style={styles.entryContainer}>
        <View style={styles.entryHeader}>
          <Text size={16} weight={600} autoTranslate={false}>
            {formatDate(item.date)}
          </Text>
          {item.efficiencyKmPerLiter && (
            <View
              style={{
                backgroundColor: getEfficiencyColor(item.efficiencyKmPerLiter),
                borderColor: getEfficiencyColor(item.efficiencyKmPerLiter),
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                borderWidth: 1,
              }}
            >
              <Text size={12} weight={600} color="white" autoTranslate={false}>
                {item.efficiencyKmPerLiter.toFixed(1)} KM/L
              </Text>
            </View>
          )}
        </View>

        <View style={styles.entryDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text size={12} color="grey70" autoTranslate={false}>
                Distance Driven
              </Text>
              <Text size={14} weight={600} autoTranslate={false}>
                {item.kilometersDriven?.toLocaleString() || 'N/A'} km
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text size={12} color="grey70" autoTranslate={false}>
                Fuel Consumed
              </Text>
              <Text size={14} weight={600} autoTranslate={false}>
                {item.litersConsumed.toFixed(1)} L
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text size={12} color="grey70" autoTranslate={false}>
                Efficiency
              </Text>
              <Text
                size={14}
                weight={600}
                style={{
                  color: item.efficiencyKmPerLiter
                    ? getEfficiencyColor(item.efficiencyKmPerLiter)
                    : mutedColor,
                }}
                autoTranslate={false}
              >
                {item.efficiencyKmPerLiter ? `${item.efficiencyKmPerLiter.toFixed(1)} KM/L` : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text size={12} color="grey70" autoTranslate={false}>
                Date Added
              </Text>
              <Text size={14} weight={600} autoTranslate={false}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.entryActions}>
          <TouchableOpacity
            style={[styles.editButton, { opacity: isUpdating ? 0.5 : 1 }]}
            onPress={() => handleEditEntry(item)}
            disabled={isUpdating}
          >
            <Feather name="edit-2" size={16} color={COLORS.light.primary} />
            <Text size={12} color="primary" style={styles.editText} autoTranslate={false}>
              {isUpdating ? 'Updating...' : 'Edit'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, { opacity: isDeleting ? 0.5 : 1 }]}
            onPress={() => handleDeleteEntry(item)}
            disabled={isDeleting}
          >
            <Feather name="trash-2" size={16} color={COLORS.light.danger} />
            <Text size={12} color="danger" style={styles.deleteText} autoTranslate={false}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CardWrapper>
  );

  const renderStatsCard = () => (
    <CardWrapper customStyles={styles.statsCard}>
      <View style={styles.statsContainer}>
        <Text size={18} weight={700} style={styles.statsTitle} autoTranslate={false}>
          Fuel Statistics
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text size={20} weight={700} color="primary" autoTranslate={false}>
              {stats.averageKmPerLiter.toFixed(1)}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Avg KM/L
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text size={20} weight={700} autoTranslate={false}>
              {stats.totalKilometersDriven.toLocaleString()}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Total KM
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text size={20} weight={700} autoTranslate={false}>
              {stats.totalLitersConsumed.toFixed(0)}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Total Liters
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text
              size={20}
              weight={700}
              style={{ color: getEfficiencyColor(stats.bestEfficiency) }}
              autoTranslate={false}
            >
              {stats.bestEfficiency.toFixed(1)}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Best KM/L
            </Text>
          </View>
        </View>
      </View>
    </CardWrapper>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Feather name="droplet" size={64} color={mutedColor} />
      <Text size={18} weight={600} style={styles.emptyStateTitle} autoTranslate={false}>
        No fuel records yet
      </Text>
      <Text size={14} color="grey70" style={styles.emptyStateSubtitle} autoTranslate={false}>
        Start tracking your fuel consumption by adding your first entry
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text size={28} weight={800} style={styles.pageTitle}>
          Fuel Consumption
        </Text>
        <Text size={16} color="grey70" style={styles.pageSubtitle}>
          Track and analyze your vehicle's fuel efficiency
        </Text>
      </View>

      {/* Filter Button */}
      <TouchableOpacity 
        style={styles.filterModalButton}
        onPress={() => setIsFilterModalVisible(true)}
      >
        <MaterialIcons name="filter-list" size={20} color={COLORS.light.primary} />
        <Text size={14} weight={500} style={{ color: COLORS.light.primary }}>Filters</Text>
        {(currentFilter.startDate || currentFilter.endDate) && (
          <View style={styles.filterBadge} />
        )}
      </TouchableOpacity>

      {/* Filter Display Text */}
      {getFilterDisplayText() && (
        <View style={{ marginBottom: 16 }}>
          <Text size={12} color="grey70" autoTranslate={false}>
            Filtered: {getFilterDisplayText()}
          </Text>
        </View>
      )}

      {/* Content */}
      {isLoadingData ? (
        <View style={styles.loadingContainer}>
          <Text size={16} color="grey70" autoTranslate={false}>
            {Object.keys(currentFilter).length > 0
              ? 'Filtering fuel consumption data...'
              : 'Loading fuel consumption data...'}
          </Text>
        </View>
      ) : gasData.length > 0 ? (
        <FlatList
          data={gasData}
          keyExtractor={(item) => item.gasId}
          renderItem={renderGasEntry}
          ListHeaderComponent={renderStatsCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        renderEmptyState()
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { opacity: isAdding ? 0.7 : 1 }]}
        onPress={handleAddEntry}
        disabled={isAdding}
      >
        <Feather name={isAdding ? 'loader' : 'plus'} size={24} color="white" />
      </TouchableOpacity>

      {/* Add/Edit Entry Modal */}
      {showAddModal && (
        <AddGasEntryModal
          visible={showAddModal}
          onClose={handleCloseModal}
          onAdd={handleAddGasEntry}
          lastEntry={gasData.length > 0 ? gasData[0] : undefined}
          editingEntry={editingEntry}
          isEditMode={isEditMode}
        />
      )}

      {/* Filter Modal */}
      {isFilterModalVisible && (
        <FilterGasModal
          isVisible={isFilterModalVisible}
          setVisible={setIsFilterModalVisible}
          filters={currentFilter}
          onApplyFilters={handleApplyFilter}
        />
      )}
    </SafeAreaView>
  );
};

export default GasConsumption;
