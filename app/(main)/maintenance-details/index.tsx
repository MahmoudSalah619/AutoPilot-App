import React, { useState, useMemo } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Text, Input, Button, Badge } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import MainScreenWrapper from '@/components/templates/MainScreenWrapper';
import FilterModal from '@/components/organisms/common/modals/filterModal';
import { FilterState, FilterType, DateFilterType } from '@/components/organisms/common/modals/filterModal/types';
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



const MaintenanceDetails = () => {
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const initialFilter = (filter && ['All', 'Completed', 'Upcoming'].includes(filter)) 
    ? filter as FilterType 
    : 'All';
    
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    status: initialFilter,
    dateRange: 'All'
  });
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const mutedColor = useThemeColor({}, 'grey70');
  const backgroundColor = useThemeColor({}, 'background');

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = sampleMaintenanceData;

    // Apply status filter
    if (filters.status !== 'All') {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    // Apply date range filter
    if (filters.dateRange !== 'All') {
      const dateRange = getDateRangeFilter(filters.dateRange);
      if (dateRange) {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate >= dateRange.start && itemDate <= dateRange.end;
        });
      }
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
  }, [searchText, filters]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (isOverdue: boolean, isUrgent: boolean, isUpcoming: boolean) => {
    if (isOverdue) return COLORS.light.danger;
    if (isUrgent) return '#FF9500';
    if (isUpcoming) return COLORS.light.primary;
    return COLORS.light.success;
  };

  const getUrgencyText = (daysUntil: number) => {
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return 'Due today';
    return `In ${daysUntil} days`;
  };

  const getDateRangeFilter = (dateRange: DateFilterType) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case 'LastMonth':
        const lastMonth = new Date(startOfToday);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return { start: lastMonth, end: now };
      case 'Last3Months':
        const last3Months = new Date(startOfToday);
        last3Months.setMonth(last3Months.getMonth() - 3);
        return { start: last3Months, end: now };
      case 'Last6Months':
        const last6Months = new Date(startOfToday);
        last6Months.setMonth(last6Months.getMonth() - 6);
        return { start: last6Months, end: now };
      case 'LastYear':
        const lastYear = new Date(startOfToday);
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        return { start: lastYear, end: now };
      case 'Custom':
        return {
          start: filters.customStartDate ? new Date(filters.customStartDate) : new Date(0),
          end: filters.customEndDate ? new Date(filters.customEndDate) : now
        };
      default:
        return null;
    }
  };



  const renderMaintenanceItem = ({ item }: { item: MaintenanceRecord }) => {
    const isUpcoming = item.status === 'Upcoming';
    const daysUntil = isUpcoming ? getDaysUntil(item.date) : null;
    const isOverdue = isUpcoming && daysUntil !== null && daysUntil < 0;
    const isUrgent = isUpcoming && daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;
    const statusColor = getStatusColor(isOverdue, isUrgent, isUpcoming);

    return (
      <TouchableOpacity style={styles.maintenanceCard}>
        <View style={styles.maintenanceCardLeft}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <View style={styles.maintenanceInfo}>
            <Text size={16} weight={600} style={styles.serviceTypeText}>
              {item.serviceType}
            </Text>
            <Text size={14} color="grey70" style={styles.dateText}>
              {formatDate(item.date)}
            </Text>
            {isUpcoming && daysUntil !== null && (
              <Text 
                size={12} 
                weight={500}
                style={[styles.urgencyText, { color: statusColor }]}
              >
                {getUrgencyText(daysUntil)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.maintenanceCardRight}>
          <Badge variant={isOverdue || isUrgent ? 'secondary' : isUpcoming ? 'secondary' : 'default'}>
            {isOverdue ? 'Overdue' : isUpcoming ? 'Upcoming' : 'Completed'}
          </Badge>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Feather name="calendar" size={64} color={mutedColor} />
      <Text size={18} weight={600} style={styles.emptyStateTitle} autoTranslate={false}>
        No maintenance records found
      </Text>
      <Text size={14} color="grey70" style={styles.emptyStateSubtitle} autoTranslate={false}>
        {searchText.trim() || filters.status !== 'All' || filters.dateRange !== 'All'
          ? 'Try adjusting your search or filter criteria'
          : 'Your maintenance history will appear here'}
      </Text>
    </View>
  );

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text size={28} weight={800} style={styles.pageTitle}>
        Maintenance History
      </Text>
      <Text size={16} color="grey70" style={styles.pageSubtitle}>
        View and manage all your vehicle maintenance records
      </Text>
    </View>
  );



  return (
    <View style={styles.container}>
      <MainScreenWrapper isScrollable>
        <View style={styles.contentContainer}>
          {renderHeader()}

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

          {/* Filter Button */}
          <TouchableOpacity 
            style={styles.filterModalButton}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <MaterialIcons name="filter-list" size={20} color={COLORS.light.primary} />
            <Text size={14} weight={500} style={{ color: COLORS.light.primary }}>Filters</Text>
            {(filters.status !== 'All' || filters.dateRange !== 'All') && (
              <View style={styles.filterBadge}>
                <Text size={10} weight={600} color="white">•</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Results Summary */}
          <View style={styles.summaryContainer}>
            <Text size={14} color="grey70" autoTranslate={false}>
              {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'} found
            </Text>
          </View>
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
      </MainScreenWrapper>

      {/* Filter Modal */}
      <FilterModal
        isVisible={isFilterModalVisible}
        setVisible={setIsFilterModalVisible}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </View>
  );
};

const styles = {
  // Container
  container: {
    flex: 1,
  },
  contentContainer: {
    gap: 20,
  },

  // Header Section
  headerSection: {
    gap: 4,
  },
  pageTitle: {
    // Spacing handled by headerSection gap
  },
  pageSubtitle: {
    lineHeight: 22,
  },



  // Search and Filter
  searchContainer: {
    // Spacing handled by contentContainer gap
  },
  filterContainer: {
    gap: 8,
  },
  filterLabel: {
    // Spacing handled by filterContainer gap
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
    // Spacing handled by contentContainer gap
  },

  // Maintenance List (matching main page design)
  listContainer: {
    paddingBottom: 20,
    gap: 12,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center' as const,
  },
  maintenanceCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.light.greyF5,
    borderWidth: 1,
    borderColor: COLORS.light.greyE5,
  },
  maintenanceCardLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    gap: 12,
  },
  statusIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  maintenanceInfo: {
    flex: 1,
    gap: 4,
  },
  serviceTypeText: {
    // Spacing handled by maintenanceInfo gap
  },
  dateText: {
    lineHeight: 18,
  },
  urgencyText: {
    lineHeight: 16,
  },
  maintenanceCardRight: {
    // Spacing handled by maintenanceCard layout
  },

  // Filter Modal Button
  filterModalButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.light.primary,
    backgroundColor: COLORS.light.primary + '10',
    gap: 8,
  },
  filterBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.light.primary,
    marginLeft: 4,
  },



  // Empty State
  emptyStateContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 16,
  },
  emptyStateTitle: {
    textAlign: 'center' as const,
  },
  emptyStateSubtitle: {
    textAlign: 'center' as const,
    lineHeight: 20,
  },
};

export default MaintenanceDetails;
