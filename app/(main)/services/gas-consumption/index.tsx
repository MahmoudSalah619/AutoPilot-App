import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Text, Badge } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import AddGasEntryModal from '@/components/organisms/scoped/services/AddGasEntryModal';
import { COLORS } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GasConsumptionEntry, GasConsumptionStats } from '@/@types/gasConsumption';

// Sample data for demonstration
const sampleGasData: GasConsumptionEntry[] = [
  {
    id: '1',
    date: '2025-09-20',
    kilometersTotal: 50000,
    litersFilled: 45.2,
    kmPerLiter: 12.5,
    kilometersDriven: 565,
  },
  {
    id: '2',
    date: '2025-09-10',
    kilometersTotal: 49435,
    litersFilled: 42.8,
    kmPerLiter: 13.1,
    kilometersDriven: 561,
  },
  {
    id: '3',
    date: '2025-08-28',
    kilometersTotal: 48874,
    litersFilled: 41.5,
    kmPerLiter: 11.8,
    kilometersDriven: 490,
  },
  {
    id: '4',
    date: '2025-08-15',
    kilometersTotal: 48384,
    litersFilled: 39.7,
    kmPerLiter: 13.8,
    kilometersDriven: 548,
  },
  {
    id: '5',
    date: '2025-08-01',
    kilometersTotal: 47836,
    litersFilled: 44.1,
    kmPerLiter: 12.2,
    kilometersDriven: 538,
  },
];

const GasConsumption = () => {
  const [gasData, setGasData] = useState<GasConsumptionEntry[]>(sampleGasData);
  const [showAddModal, setShowAddModal] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'grey70');
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');

  // Calculate statistics
  const calculateStats = (): GasConsumptionStats => {
    if (gasData.length === 0) {
      return {
        averageKmPerLiter: 0,
        totalKilometersDriven: 0,
        totalLitersConsumed: 0,
        bestEfficiency: 0,
        worstEfficiency: 0,
      };
    }

    const validEntries = gasData.filter((entry) => entry.kmPerLiter && entry.kmPerLiter > 0);
    const totalKilometersDriven = gasData.reduce(
      (sum, entry) => sum + (entry.kilometersDriven || 0),
      0
    );
    const totalLitersConsumed = gasData.reduce((sum, entry) => sum + entry.litersFilled, 0);
    const kmPerLiterValues = validEntries.map((entry) => entry.kmPerLiter!);

    return {
      averageKmPerLiter:
        kmPerLiterValues.length > 0
          ? kmPerLiterValues.reduce((sum, val) => sum + val, 0) / kmPerLiterValues.length
          : 0,
      totalKilometersDriven,
      totalLitersConsumed,
      bestEfficiency: kmPerLiterValues.length > 0 ? Math.max(...kmPerLiterValues) : 0,
      worstEfficiency: kmPerLiterValues.length > 0 ? Math.min(...kmPerLiterValues) : 0,
    };
  };

  const stats = calculateStats();

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
    setShowAddModal(true);
  };

  const handleAddGasEntry = (newEntry: GasConsumptionEntry) => {
    setGasData((prevData) => [newEntry, ...prevData]);
  };

  const renderGasEntry = ({ item }: { item: GasConsumptionEntry }) => (
    <CardWrapper customStyles={styles.entryCard}>
      <View style={styles.entryContainer}>
        <View style={styles.entryHeader}>
          <Text size={16} weight={600} autoTranslate={false}>
            {formatDate(item.date)}
          </Text>
          {item.kmPerLiter && (
            <View
              style={{
                backgroundColor: getEfficiencyColor(item.kmPerLiter),
                borderColor: getEfficiencyColor(item.kmPerLiter),
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                borderWidth: 1,
              }}
            >
              <Text size={12} weight={600} color="white" autoTranslate={false}>
                {item.kmPerLiter.toFixed(1)} KM/L
              </Text>
            </View>
          )}
        </View>

        <View style={styles.entryDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text size={12} color="grey70" autoTranslate={false}>
                Odometer
              </Text>
              <Text size={14} weight={600} autoTranslate={false}>
                {item.kilometersTotal.toLocaleString()} km
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text size={12} color="grey70" autoTranslate={false}>
                Distance Driven
              </Text>
              <Text size={14} weight={600} autoTranslate={false}>
                {item.kilometersDriven?.toLocaleString() || 'N/A'} km
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text size={12} color="grey70" autoTranslate={false}>
                Fuel Filled
              </Text>
              <Text size={14} weight={600} autoTranslate={false}>
                {item.litersFilled.toFixed(1)} L
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text size={12} color="grey70" autoTranslate={false}>
                Efficiency
              </Text>
              <Text
                size={14}
                weight={600}
                style={{
                  color: item.kmPerLiter ? getEfficiencyColor(item.kmPerLiter) : mutedColor,
                }}
                autoTranslate={false}
              >
                {item.kmPerLiter ? `${item.kmPerLiter.toFixed(1)} KM/L` : 'N/A'}
              </Text>
            </View>
          </View>
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
      {gasData.length > 0 ? (
        <FlatList
          data={gasData}
          keyExtractor={(item) => item.id}
          renderItem={renderGasEntry}
          ListHeaderComponent={renderStatsCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        renderEmptyState()
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddEntry}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
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
};

export default GasConsumption;
