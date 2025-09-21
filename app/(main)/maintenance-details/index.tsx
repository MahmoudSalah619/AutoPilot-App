import React, { useState, useMemo } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Text, Input, Button, Badge } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import { COLORS } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MaintenanceRecord } from '@/@types/maintenance';

// Extended sample data for demonstration
const sampleMaintenanceData: MaintenanceRecord[] = [
  // Recent (completed) maintenance
  {
    id: '1',
    serviceType: 'Oil Change',
    date: '2025-09-15',
    status: 'Completed',
  },
  {
    id: '2',
    serviceType: 'Tire Rotation',
    date: '2025-08-20',
    status: 'Completed',
  },
  {
    id: '3',
    serviceType: 'Brake Inspection',
    date: '2025-07-10',
    status: 'Completed',
  },
  {
    id: '7',
    serviceType: 'Battery Check',
    date: '2025-06-05',
    status: 'Completed',
  },
  {
    id: '8',
    serviceType: 'Transmission Service',
    date: '2025-05-15',
    status: 'Completed',
  },
  {
    id: '9',
    serviceType: 'Wheel Alignment',
    date: '2025-04-20',
    status: 'Completed',
  },
  {
    id: '10',
    serviceType: 'Spark Plug Replacement',
    date: '2025-03-10',
    status: 'Completed',
  },
  // Upcoming maintenance
  {
    id: '4',
    serviceType: 'Engine Tune-up',
    date: '2025-10-15',
    status: 'Upcoming',
  },
  {
    id: '5',
    serviceType: 'Air Filter Replacement',
    date: '2025-11-01',
    status: 'Upcoming',
  },
  {
    id: '6',
    serviceType: 'Coolant Check',
    date: '2025-12-05',
    status: 'Upcoming',
  },
  {
    id: '11',
    serviceType: 'Tire Replacement',
    date: '2026-01-15',
    status: 'Upcoming',
  },
  {
    id: '12',
    serviceType: 'Annual Inspection',
    date: '2026-02-20',
    status: 'Upcoming',
  },
];

type FilterType = 'All' | 'Completed' | 'Upcoming';

const MaintenanceDetails = () => {
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const initialFilter = (filter && ['All', 'Completed', 'Upcoming'].includes(filter)) 
    ? filter as FilterType 
    : 'All';
    
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(initialFilter);

  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'grey70');
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');

  const filterOptions: FilterType[] = ['All', 'Completed', 'Upcoming'];

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = sampleMaintenanceData;

    // Apply status filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter((item) => item.status === selectedFilter);
    }

    // Apply search filter
    if (searchText.trim()) {
      filtered = filtered.filter((item) =>
        item.serviceType.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Sort by date (most recent first for completed, earliest first for upcoming)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (a.status === 'Completed' && b.status === 'Completed') {
        return dateB - dateA; // Most recent first for completed
      } else if (a.status === 'Upcoming' && b.status === 'Upcoming') {
        return dateA - dateB; // Earliest first for upcoming
      } else {
        return a.status === 'Completed' ? 1 : -1; // Upcoming first, then completed
      }
    });
  }, [searchText, selectedFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderFilterButton = (filter: FilterType) => (
    <TouchableOpacity
      key={filter}
      style={[styles.filterButton, selectedFilter === filter && styles.activeFilterButton]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        size={14}
        weight={600}
        color={selectedFilter === filter ? 'white' : 'grey70'}
        autoTranslate={false}
      >
        {filter}
      </Text>
    </TouchableOpacity>
  );

  const renderMaintenanceItem = ({ item }: { item: MaintenanceRecord }) => (
    <CardWrapper customStyles={styles.itemCard}>
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <View style={styles.serviceInfo}>
            <Text size={16} weight={600} style={styles.serviceTypeText} autoTranslate={false}>
              {item.serviceType}
            </Text>
            <Text size={14} color="grey70" style={styles.dateText} autoTranslate={false}>
              {formatDate(item.date)}
            </Text>
          </View>
          <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'}>
            {item.status}
          </Badge>
        </View>
        <TouchableOpacity style={styles.detailsButton}>
          <Feather name="chevron-right" size={20} color={mutedColor} />
        </TouchableOpacity>
      </View>
    </CardWrapper>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Feather name="calendar" size={64} color={mutedColor} />
      <Text size={18} weight={600} style={styles.emptyStateTitle} autoTranslate={false}>
        No maintenance records found
      </Text>
      <Text size={14} color="grey70" style={styles.emptyStateSubtitle} autoTranslate={false}>
        {searchText.trim()
          ? 'Try adjusting your search or filter criteria'
          : 'Your maintenance history will appear here'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search maintenance services..."
          value={searchText}
          onChangeText={setSearchText}
          prefix={<Feather name="search" size={20} color={mutedColor} />}
          suffix={
            searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Feather name="x" size={20} color={mutedColor} />
              </TouchableOpacity>
            ) : undefined
          }
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <Text size={16} weight={600} style={styles.filterLabel} autoTranslate={false}>
          Filter by status:
        </Text>
        <View style={styles.filterButtons}>{filterOptions.map(renderFilterButton)}</View>
      </View>

      {/* Results Summary */}
      <View style={styles.summaryContainer}>
        <Text size={14} color="grey70" autoTranslate={false}>
          {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'} found
        </Text>
      </View>

      {/* Maintenance List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderMaintenanceItem}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          filteredData.length === 0 && styles.emptyListContainer,
        ]}
      />
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
  searchContainer: {
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.light.greyF5,
    borderWidth: 1,
    borderColor: COLORS.light.greyCC,
  },
  activeFilterButton: {
    backgroundColor: COLORS.light.primary,
    borderColor: COLORS.light.primary,
  },
  summaryContainer: {
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center' as const,
  },
  itemCard: {
    marginBottom: 12,
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTypeText: {
    marginBottom: 4,
  },
  dateText: {
    marginTop: 2,
  },
  detailsButton: {
    padding: 4,
  },
  emptyStateContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
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

export default MaintenanceDetails;
