import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
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

const GasConsumption = () => {
  const { data: apiData, isLoading: isLoadingData, error } = useGetGasConsumptionQuery();
  const [addGasConsumption, { isLoading: isAdding }] = useAddGasConsumptionMutation();
  const [updateGasConsumption, { isLoading: isUpdating }] = useUpdateGasConsumptionMutation();
  const [deleteGasConsumption, { isLoading: isDeleting }] = useDeleteGasConsumptionMutation();

  const [showAddModal, setShowAddModal] = useState(false);
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
      if (isEditMode && editingEntry) {
        // Update existing entry - include gasId
        const updateData = { ...entryData, gasId: editingEntry.gasId };
        const result = await updateGasConsumption(updateData).unwrap();
        Alert.alert('Success', 'Fuel consumption record updated successfully!');
      } else {
        // Add new entry
        const result = await addGasConsumption(entryData).unwrap();
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
      {/* Content */}
      {isLoadingData ? (
        <View style={styles.loadingContainer}>
          <Text size={16} color="grey70" autoTranslate={false}>
            Loading fuel consumption data...
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
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center' as const,
  },
  headerSpacer: {
    width: 40,
  },
  listContainer: {
    paddingBottom: 100, // Space for floating button
  },
  statsCard: {
    marginBottom: 16,
    padding: 20,
  },
  statsContainer: {
    alignItems: 'center' as const,
  },
  statsTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    width: '100%' as const,
  },
  statItem: {
    alignItems: 'center' as const,
    width: '48%' as const,
    marginBottom: 16,
  },
  entryCard: {
    marginBottom: 12,
    padding: 16,
  },
  entryContainer: {
    gap: 12,
  },
  entryHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  entryActions: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    justifyContent: 'flex-end' as const,
    marginTop: 8,
    gap: 8,
  },
  editButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  editText: {
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteText: {
    marginLeft: 4,
  },
  entryDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  detailItem: {
    flex: 1,
    alignItems: 'flex-start' as const,
  },
  addButton: {
    position: 'absolute' as const,
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.light.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  emptyStateSubtitle: {
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 20,
  },
};

export default GasConsumption;
