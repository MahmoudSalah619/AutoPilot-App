import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Text, Badge } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import { COLORS } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ServiceReminderEntry, ServiceReminderStats } from '@/@types/serviceReminder';
import AddServiceReminderModal from '@/components/organisms/scoped/services/AddServiceReminderModal';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './styles/styles';
import FilterServiceReminderModal from '@/components/organisms/scoped/services/FilterServiceReminderModal';

// Sample data for demonstration
const sampleReminderData: ServiceReminderEntry[] = [
  {
    id: '1',
    date: '2025-10-15',
    service: 'Oil Change',
    notes: 'Due for regular oil change - 5000km interval',
    status: 'upcoming',
    createdAt: '2025-09-22T10:00:00Z',
  },
  {
    id: '2',
    date: '2025-09-25',
    service: 'Tire Rotation',
    notes: 'Rotate tires to ensure even wear',
    status: 'upcoming',
    createdAt: '2025-09-20T14:30:00Z',
  },
  {
    id: '3',
    date: '2025-08-20',
    service: 'Brake Inspection',
    notes: 'Annual brake system inspection completed',
    status: 'completed',
    createdAt: '2025-08-15T09:15:00Z',
  },
  {
    id: '4',
    date: '2025-07-10',
    service: 'Air Filter Replacement',
    notes: 'Replaced cabin and engine air filters',
    status: 'completed',
    createdAt: '2025-07-08T16:45:00Z',
  },
  {
    id: '5',
    date: '2025-09-20',
    service: 'Battery Check',
    notes: 'Check battery voltage and terminals',
    status: 'upcoming',
    createdAt: '2025-09-15T11:20:00Z',
  },
];

const ServiceReminders = () => {
  const [reminderData, setReminderData] = useState<ServiceReminderEntry[]>(sampleReminderData);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ServiceReminderEntry | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string }>({});

  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'grey70');
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');

  // Calculate statistics
  const calculateStats = (): ServiceReminderStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalReminders = reminderData.length;
    const upcomingReminders = reminderData.filter(
      (reminder) => reminder.status === 'upcoming'
    ).length;
    const completedReminders = reminderData.filter(
      (reminder) => reminder.status === 'completed'
    ).length;
    const overdueReminders = reminderData.filter(
      (reminder) => 
        reminder.status === 'upcoming' && 
        new Date(reminder.date) < today
    ).length;

    return {
      totalReminders,
      upcomingReminders,
      completedReminders,
      overdueReminders,
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

  const getStatusColor = (status: 'upcoming' | 'completed') => {
    switch (status) {
      case 'completed':
        return COLORS.light.success;
      case 'upcoming':
        return COLORS.light.primary;
      default:
        return COLORS.light.grey;
    }
  };

  const getStatusText = (reminder: ServiceReminderEntry) => {
    if (reminder.status === 'completed') return 'Completed';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(reminder.date);
    reminderDate.setHours(0, 0, 0, 0);
    
    if (reminderDate < today) return 'Overdue';
    return 'Upcoming';
  };

  const isOverdue = (reminder: ServiceReminderEntry) => {
    if (reminder.status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(reminder.date) < today;
  };

  const handleAddReminder = () => {
    setShowAddModal(true);
  };

  const handleAddServiceReminder = (newReminder: ServiceReminderEntry) => {
    setReminderData((prevData) => [newReminder, ...prevData]);
  };

  const handleApplyFilters = (newFilters: { startDate?: string; endDate?: string }) => {
    setFilters(newFilters);
    // TODO: Pass filters to API when backend integration is ready
    console.log('Applied filters:', newFilters);
  };

  const handleDeleteReminder = (reminderId: string) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this service reminder? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setReminderData((prevData) => prevData.filter((reminder) => reminder.id !== reminderId));
          },
        },
      ]
    );
  };

  const handleToggleStatus = (reminderId: string) => {
    setReminderData((prevData) =>
      prevData.map((reminder) =>
        reminder.id === reminderId
          ? {
              ...reminder,
              status: reminder.status === 'upcoming' ? 'completed' : 'upcoming',
            }
          : reminder
      )
    );
  };

  const renderReminderEntry = ({ item }: { item: ServiceReminderEntry }) => (
    <CardWrapper customStyles={styles.entryCard}>
      <View style={styles.entryContainer}>
        <View style={styles.entryHeader}>
          <Text size={16} weight={600} autoTranslate={false}>
            {item.service}
          </Text>
          <View
            style={{
              backgroundColor: isOverdue(item) ? COLORS.light.danger : getStatusColor(item.status),
              borderColor: isOverdue(item) ? COLORS.light.danger : getStatusColor(item.status),
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
            }}
          >
            <Text size={12} weight={600} color="white" autoTranslate={false}>
              {isOverdue(item) ? 'Overdue' : getStatusText(item)}
            </Text>
          </View>
        </View>

        <View style={styles.entryDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text size={12} color="grey70" autoTranslate={false}>
                Service Date
              </Text>
              <Text size={14} weight={600} autoTranslate={false}>
                {formatDate(item.date)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text size={12} color="grey70" autoTranslate={false}>
                Status
              </Text>
              <Text 
                size={14} 
                weight={600}
                style={{
                  color: isOverdue(item) ? COLORS.light.danger : getStatusColor(item.status),
                }}
                autoTranslate={false}
              >
                {getStatusText(item)}
              </Text>
            </View>
          </View>

          {item.notes && (
            <View style={styles.notesSection}>
              <Text size={12} color="grey70" autoTranslate={false}>
                Notes
              </Text>
              <Text size={14} style={styles.notesText} autoTranslate={false}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.entryActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleToggleStatus(item.id)}
          >
            <Feather 
              name={item.status === 'completed' ? 'rotate-ccw' : 'check'} 
              size={16} 
              color={COLORS.light.primary} 
            />
            <Text size={12} color="primary" style={styles.actionText} autoTranslate={false}>
              {item.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteReminder(item.id)}
          >
            <Feather name="trash-2" size={16} color={COLORS.light.danger} />
            <Text size={12} color="danger" style={styles.deleteText} autoTranslate={false}>
              Delete
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
          Service Overview
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text size={20} weight={700} color="primary" autoTranslate={false}>
              {stats.totalReminders}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Total Reminders
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text size={20} weight={700} style={{ color: COLORS.light.primary }} autoTranslate={false}>
              {stats.upcomingReminders}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Upcoming
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text size={20} weight={700} style={{ color: COLORS.light.success }} autoTranslate={false}>
              {stats.completedReminders}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Completed
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text 
              size={20} 
              weight={700} 
              style={{ color: stats.overdueReminders > 0 ? COLORS.light.danger : COLORS.light.grey }}
              autoTranslate={false}
            >
              {stats.overdueReminders}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Overdue
            </Text>
          </View>
        </View>
      </View>
    </CardWrapper>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Feather name="bell" size={64} color={mutedColor} />
      <Text size={18} weight={600} style={styles.emptyStateTitle} autoTranslate={false}>
        No service reminders yet
      </Text>
      <Text size={14} color="grey70" style={styles.emptyStateSubtitle} autoTranslate={false}>
        Stay on top of your vehicle maintenance by adding your first service reminder
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text size={28} weight={800} style={styles.pageTitle}>
          Service Reminders
        </Text>
        <Text size={16} color="grey70" style={styles.pageSubtitle}>
          Manage and track your vehicle service schedule
        </Text>
      </View>

      {/* Filter Button */}
      <TouchableOpacity 
        style={styles.filterModalButton}
        onPress={() => setIsFilterModalVisible(true)}
      >
        <MaterialIcons name="filter-list" size={20} color={COLORS.light.primary} />
        <Text size={14} weight={500} style={{ color: COLORS.light.primary }}>Filters</Text>
        {(filters.startDate || filters.endDate) && (
          <View style={styles.filterBadge}>
            <Text size={10} weight={600} color="white">•</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Content */}
      {reminderData.length > 0 ? (
        <FlatList
          data={reminderData}
          keyExtractor={(item) => item.id}
          renderItem={renderReminderEntry}
          ListHeaderComponent={renderStatsCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        renderEmptyState()
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Add Reminder Modal */}
      <AddServiceReminderModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddServiceReminder}
      />

      {/* Filter Modal */}
      <FilterServiceReminderModal
        isVisible={isFilterModalVisible}
        setVisible={setIsFilterModalVisible}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </SafeAreaView>
  );
};

export default ServiceReminders;
