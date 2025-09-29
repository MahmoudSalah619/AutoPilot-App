import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import MainScreenWrapper from '@/components/templates/MainScreenWrapper';
import { Button, Text, Badge } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import AddMaintenanceModal from '@/components/organisms/common/modals/addMaintainance';

import { MaintenanceRecord } from '@/@types/maintenance';
import { COLORS } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

// ===== SAMPLE DATA =====
const sampleMaintenanceData: MaintenanceRecord[] = [
  // Recent (completed) maintenance
  { id: '1', serviceType: 'Oil Change', date: '2025-09-15' },
  { id: '2', serviceType: 'Tire Rotation', date: '2025-08-20' },
  { id: '3', serviceType: 'Brake Inspection', date: '2025-07-10' },

  // Upcoming maintenance
  { id: '4', serviceType: 'Engine Tune-up', date: '2025-10-15' },
  { id: '5', serviceType: 'Air Filter Replacement', date: '2025-11-01' },
  { id: '6', serviceType: 'Coolant Check', date: '2025-12-05' },
];

// ===== MAIN COMPONENT =====
const Maintenance = () => {
  // ===== STATE =====
  const [isUpdateModalVisible, setisUpdateModalVisible] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState<any | null>(null);

  // ===== HOOKS =====
  const mutedColor = useThemeColor({}, 'grey70');

  // ===== HANDLERS =====
  const handleAddEntry = () => {
    setisUpdateModalVisible(true);
  };

  // ===== UTILITY FUNCTIONS =====
  const getUpcomingMaintenance = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sampleMaintenanceData
      .filter((item) => new Date(item.date).getTime() > today.getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getRecentMaintenance = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sampleMaintenanceData
      .filter((item) => new Date(item.date).getTime() <= today.getTime())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // ===== RENDER FUNCTIONS =====
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

  const renderMaintenanceItem = (item: MaintenanceRecord, isUpcoming: boolean = false) => {
    const daysUntil = isUpcoming ? getDaysUntil(item.date) : null;
    const isOverdue = isUpcoming && daysUntil !== null && daysUntil < 0;
    const isUrgent = isUpcoming && daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;
    const statusColor = getStatusColor(isOverdue, isUrgent, isUpcoming);

    return (
      <TouchableOpacity key={item.id} style={styles.maintenanceCard}>
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
              <Text size={12} weight={500} style={[styles.urgencyText, { color: statusColor }]}>
                {getUrgencyText(daysUntil)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.maintenanceCardRight}>
          <Badge
            variant={isOverdue || isUrgent ? 'secondary' : isUpcoming ? 'secondary' : 'default'}
          >
            {isOverdue ? 'Overdue' : isUpcoming ? 'Upcoming' : 'Completed'}
          </Badge>
        </View>
      </TouchableOpacity>
    );
  };

  // ===== DATA =====
  const upcomingMaintenance = getUpcomingMaintenance();
  const recentMaintenance = getRecentMaintenance();

  // ===== EMPTY STATE =====
  const renderEmptyState = () => (
    <MainScreenWrapper isScrollable>
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <MaterialIcons name="build" size={64} color={mutedColor} />
        </View>
        <Text size={24} weight={700} isCentered style={styles.emptyTitle}>
          Keep Your Vehicle Healthy
        </Text>
        <Text size={16} color="grey70" isCentered style={styles.emptyDescription}>
          Track your maintenance history and never miss important services. Regular maintenance
          keeps your vehicle safe and extends its life.
        </Text>
        <View style={styles.emptyButton}>
          <Button onPress={handleAddEntry} title="Add Your First Maintenance" />
        </View>
        {newMaintenance && (
          <Text size={14} color="grey70" isCentered style={styles.debugText}>
            Last submitted: {JSON.stringify(newMaintenance)}
          </Text>
        )}
      </View>
      <AddMaintenanceModal
        isVisible={isUpdateModalVisible}
        setVisible={setisUpdateModalVisible}
        onSubmit={(data) => {
          setNewMaintenance(data);
          setisUpdateModalVisible(false);
        }}
      />
    </MainScreenWrapper>
  );

  if (sampleMaintenanceData.length === 0) {
    return renderEmptyState();
  }

  // ===== RENDER SECTIONS =====
  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text size={28} weight={800} style={styles.pageTitle}>
        Vehicle Maintenance
      </Text>
      <Text size={16} color="grey70" style={styles.pageSubtitle}>
        Stay on top of your vehicle's health and performance
      </Text>
    </View>
  );

  const renderStats = () => {
    // Use all maintenance data for comprehensive stats
    const completedCount = sampleMaintenanceData.filter(item => {
      const recordDate = new Date(item.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return recordDate.getTime() <= today.getTime();
    }).length;
    
    const upcomingCount = sampleMaintenanceData.filter(item => {
      const recordDate = new Date(item.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return recordDate.getTime() > today.getTime();
    }).length;
    
    const totalCount = sampleMaintenanceData.length;
    
    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: COLORS.light.primary + '15' }]}>
          <Text size={24} weight={700} style={[styles.statNumber, { color: COLORS.light.primary }]}>
            {upcomingCount}
          </Text>
          <Text size={12} color="grey70" style={styles.statLabel}>
            Upcoming
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.light.success + '15' }]}>
          <Text size={24} weight={700} style={[styles.statNumber, { color: COLORS.light.success }]}>
            {completedCount}
          </Text>
          <Text size={12} color="grey70" style={styles.statLabel}>
            Completed
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.light.greyCC + '15' }]}>
          <Text size={24} weight={700} style={[styles.statNumber, { color: COLORS.light.text }]}>
            {totalCount}
          </Text>
          <Text size={12} color="grey70" style={styles.statLabel}>
            Total
          </Text>
        </View>
      </View>
    );
  };

  const renderMaintenanceSection = (
    title: string,
    icon: string,
    iconColor: string,
    description: string,
    data: MaintenanceRecord[],
    filterParam: string,
    isUpcoming: boolean
  ) => (
    <View style={styles.sectionCard}>
      <CardWrapper>
        <View style={styles.sectionContent}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name={icon as any} size={24} color={iconColor} />
              <Text size={20} weight={700} style={styles.sectionTitle}>
                {title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/(main)/maintenance-details?filter=${filterParam}` as any)}
              style={styles.viewAllButton}
            >
              <Feather name="chevron-right" size={20} color={COLORS.light.primary} />
            </TouchableOpacity>
          </View>
          <Text size={14} color="grey70" style={styles.sectionDescription}>
            {description}
          </Text>
          <View style={styles.maintenanceList}>
            {data.slice(0, 3).map((item) => renderMaintenanceItem(item, isUpcoming))}
          </View>
          {data.length > 3 && (
            <TouchableOpacity
              onPress={() => router.push(`/(main)/maintenance-details?filter=${filterParam}` as any)}
              style={styles.sectionBottomButton}
            >
              <Text
                size={14}
                weight={500}
                style={[styles.sectionBottomButtonText, { color: COLORS.light.primary }]}
              >
                View All {data.length} {title}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </CardWrapper>
    </View>
  );

  // ===== MAIN RENDER =====
  return (
    <View style={styles.container}>
      <MainScreenWrapper isScrollable>
        <View style={styles.contentContainer}>
          {renderHeader()}
          {renderStats()}

          {upcomingMaintenance.length > 0 &&
            renderMaintenanceSection(
              'Upcoming Services',
              'schedule',
              COLORS.light.primary,
              "Don't miss these important services to keep your vehicle running smoothly",
              upcomingMaintenance,
              'Upcoming',
              true
            )}

          {recentMaintenance.length > 0 &&
            renderMaintenanceSection(
              'Recent Services',
              'check-circle',
              COLORS.light.success,
              "Your vehicle's maintenance history and completed services",
              recentMaintenance,
              'Completed',
              false
            )}
        </View>
      </MainScreenWrapper>

      <TouchableOpacity style={styles.addButton} onPress={handleAddEntry}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>

      <AddMaintenanceModal
        isVisible={isUpdateModalVisible}
        setVisible={setisUpdateModalVisible}
        onSubmit={(data) => {
          setNewMaintenance(data);
          setisUpdateModalVisible(false);
        }}
      />
    </View>
  );
};
// ===== STYLES =====
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

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyTitle: {
    marginBottom: 12,
  },
  emptyDescription: {
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center' as const,
  },
  emptyButton: {
    marginTop: 8,
  },
  debugText: {
    marginTop: 16,
    opacity: 0.6,
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center' as const,
    gap: 4,
  },
  statNumber: {
    // Spacing handled by statCard gap
  },
  statLabel: {
    textAlign: 'center' as const,
  },

  // Section Cards
  sectionCard: {
    // Spacing handled by contentContainer gap
  },
  sectionContent: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  sectionTitleContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  sectionTitle: {
    // Keep original styling
  },
  sectionDescription: {
    lineHeight: 20,
  },
  viewAllButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.light.primary + '10',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  sectionBottomButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.light.primary + '30',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  sectionBottomButtonText: {
    textAlign: 'center' as const,
  },

  // Maintenance List
  maintenanceList: {
    gap: 12,
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

  // Floating Action Button
  addButton: {
    position: 'absolute' as const,
    bottom: 84,
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
    zIndex: 1000,
  },
};
export default Maintenance;
