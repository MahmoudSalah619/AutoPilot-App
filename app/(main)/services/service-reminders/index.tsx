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
import styles from './styles';
import FilterServiceReminderModal from '@/components/organisms/scoped/services/FilterServiceReminderModal';
import {
  useGetRemindersQuery,
  useAddReminderMutation,
  useDeleteReminderMutation,
  useCompleteReminderMutation,
} from '@/apis/services/services/reminders';
import { useGetTypesQuery } from '@/apis/services/services/types';
import { ReminderItem } from '@/apis/@types/reminder';

const ServiceReminders = () => {
  // State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string }>({});

  // API queries
  const {
    data: remindersResponse,
    isLoading: isLoadingReminders,
    error: remindersError,
    refetch,
  } = useGetRemindersQuery(filters);
  const { data: typesResponse, isLoading: isLoadingTypes } = useGetTypesQuery();
  const [addReminder] = useAddReminderMutation();
  const [deleteReminder] = useDeleteReminderMutation();
  const [completeReminder] = useCompleteReminderMutation();

  // Use backend data directly
  const reminderData = remindersResponse?.data || [];

  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'grey70');
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');

  // Use statistics from backend
  const stats = remindersResponse?.statistics || {
    totalReminders: 0,
    upcoming: 0,
    completed: 0,
    overdue: 0,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (isCompleted: boolean) => {
    if (isCompleted) {
      return COLORS.light.success;
    }
    return COLORS.light.primary;
  };

  const getStatusText = (reminder: ReminderItem) => {
    if (reminder.isCompleted) return 'Completed';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(reminder.reminderDate);
    reminderDate.setHours(0, 0, 0, 0);

    if (reminderDate < today) return 'Overdue';
    return 'Upcoming';
  };

  const isOverdue = (reminder: ReminderItem) => {
    if (reminder.isCompleted) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(reminder.reminderDate) < today;
  };

  const handleAddReminder = () => {
    setShowAddModal(true);
  };

  const handleAddServiceReminder = async (newReminder: ServiceReminderEntry) => {
    try {
      // Find the service type ID based on the service name
      const serviceType = typesResponse?.data.find((type) => type.name === newReminder.service);
      if (!serviceType) {
        Alert.alert('Error', 'Service type not found');
        return;
      }

      await addReminder({
        serviceTypeId: serviceType.serviceTypeId,
        reminderDate: newReminder.date,
        notes: newReminder.notes,
        isCompleted: newReminder.status === 'completed',
      }).unwrap();
    } catch (error) {
      console.error('Error adding reminder:', error);
      Alert.alert('Error', 'Failed to add service reminder. Please try again.');
    }
  };

  const handleApplyFilters = (newFilters: { startDate?: string; endDate?: string }) => {
    setFilters(newFilters);
    // Filters will be passed to the API query automatically
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
          onPress: async () => {
            try {
              console.log('Deleting reminder with ID:', reminderId);

              await deleteReminder({ reminderId }).unwrap();
            } catch (error) {
              console.error('Error deleting reminder:', error);
              Alert.alert('Error', 'Failed to delete service reminder. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      await completeReminder({ reminderId }).unwrap();
    } catch (error) {
      console.error('Error completing reminder:', error);
      Alert.alert('Error', 'Failed to complete reminder. Please try again.');
    }
  };

  const handleMarkPending = async (reminderId: string) => {
    try {
      await completeReminder({ reminderId }).unwrap();
    } catch (error) {
      console.error('Error marking reminder as pending:', error);
      Alert.alert('Error', 'Failed to mark reminder as pending. Please try again.');
    }
  };

  const renderReminderEntry = ({ item }: { item: ReminderItem }) => (
    <CardWrapper customStyles={styles.entryCard}>
      <View style={styles.entryContainer}>
        <View style={styles.entryHeader}>
          <Text size={16} weight={600} autoTranslate={false}>
            {item.serviceType.name}
          </Text>
          <View
            style={{
              backgroundColor: isOverdue(item)
                ? COLORS.light.danger
                : getStatusColor(item.isCompleted),
              borderColor: isOverdue(item) ? COLORS.light.danger : getStatusColor(item.isCompleted),
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
                {formatDate(item.reminderDate)}
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
                  color: isOverdue(item) ? COLORS.light.danger : getStatusColor(item.isCompleted),
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
            onPress={() => {
              if (item.isCompleted) {
                handleMarkPending(item.reminderId);
              } else {
                handleCompleteReminder(item.reminderId);
              }
            }}
          >
            <Feather
              name={item.isCompleted ? 'rotate-ccw' : 'check'}
              size={16}
              color={COLORS.light.primary}
            />
            <Text size={12} color="primary" style={styles.actionText} autoTranslate={false}>
              {item.isCompleted ? 'Mark Pending' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteReminder(item.reminderId)}
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
            <Text
              size={20}
              weight={700}
              style={{ color: COLORS.light.primary }}
              autoTranslate={false}
            >
              {stats.upcoming}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Upcoming
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text
              size={20}
              weight={700}
              style={{ color: COLORS.light.success }}
              autoTranslate={false}
            >
              {stats.completed}
            </Text>
            <Text size={12} color="grey70" autoTranslate={false}>
              Completed
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text
              size={20}
              weight={700}
              style={{ color: stats.overdue > 0 ? COLORS.light.danger : COLORS.light.grey }}
              autoTranslate={false}
            >
              {stats.overdue}
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
      {/* <TouchableOpacity
        style={styles.filterModalButton}
        onPress={() => setIsFilterModalVisible(true)}
      >
        <MaterialIcons name="filter-list" size={20} color={COLORS.light.primary} />
        <Text size={14} weight={500} style={{ color: COLORS.light.primary }}>
          Filters
        </Text>
        {(filters.startDate || filters.endDate) && (
          <View style={styles.filterBadge}>
            <Text size={10} weight={600} color="white">
              •
            </Text>
          </View>
        )}
      </TouchableOpacity> */}

      {/* Content */}
      {isLoadingReminders || isLoadingTypes ? (
        <View style={styles.loadingContainer}>
          <Text size={16} color="grey70">
            Loading service reminders...
          </Text>
        </View>
      ) : remindersError ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={COLORS.light.danger} />
          <Text size={16} weight={600} style={{ marginTop: 16 }}>
            Failed to load reminders
          </Text>
          <Text size={14} color="grey70" style={{ marginTop: 8, textAlign: 'center' }}>
            Please check your connection and try again
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text size={14} weight={600} color="primary">
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : reminderData.length > 0 ? (
        <FlatList
          data={reminderData}
          keyExtractor={(item) => item.reminderId}
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
        serviceTypes={typesResponse?.data || []}
        isLoading={isLoadingTypes}
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
