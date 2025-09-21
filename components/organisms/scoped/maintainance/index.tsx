import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Text, Button, Badge } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import { COLORS } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MaintenanceScheduleProps, MaintenanceRecord } from '@/@types/maintenance';
import styles from './styles';

export function MaintenanceSchedule({ initialData, type = 'all' }: MaintenanceScheduleProps) {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'grey70');

  const getStatus = (
    date: string,
  ): { text: 'Completed' | 'Upcoming'; variant: 'default' | 'secondary' } => {
    const recordDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return recordDate.getTime() <= today.getTime()
      ? { text: 'Completed', variant: 'default' }
      : { text: 'Upcoming', variant: 'secondary' };
  };

  // Filter data based on type prop
  const getFilteredData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (type === 'recent') {
      return initialData.filter(item => {
        const recordDate = new Date(item.date);
        return recordDate.getTime() <= today.getTime();
      });
    } else if (type === 'upcoming') {
      return initialData.filter(item => {
        const recordDate = new Date(item.date);
        return recordDate.getTime() > today.getTime();
      });
    }
    return initialData; // 'all' type returns all data
  };

  const filteredData = getFilteredData();

  // Get title and description based on type
  const getCardContent = () => {
    switch (type) {
      case 'recent':
        return {
          title: 'Recent Maintenance',
          description: 'A look at your vehicle\'s most recent services.',
          emptyMessage: 'No recent maintenance found.',
          emptySubMessage: 'Your completed services will appear here.'
        };
      case 'upcoming':
        return {
          title: 'Upcoming Maintenance',
          description: 'Your scheduled maintenance services.',
          emptyMessage: 'No upcoming maintenance scheduled.',
          emptySubMessage: 'Schedule your next service to see it here.'
        };
      default:
        return {
          title: 'Maintenance Schedule',
          description: 'Track your vehicle\'s maintenance history and upcoming services.',
          emptyMessage: 'No maintenance records found.',
          emptySubMessage: 'Add a new record to see it here.'
        };
    }
  };

  const cardContent = getCardContent();

  const handleViewFullSchedule = () => {
    // Navigate to full maintenance schedule screen with appropriate filter
    const filterParam = type === 'upcoming' ? 'Upcoming' : type === 'recent' ? 'Completed' : 'All';
    router.push(`/(main)/maintenance-details?filter=${filterParam}` as any);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderMaintenanceItems = (items: MaintenanceRecord[]) => {
    return items.map((item: MaintenanceRecord) => {
      const { text, variant } = getStatus(item.date);
      return (
        <View key={item.id} style={styles.maintenanceItem}>
          <View style={styles.maintenanceItemContent}>
            <Text 
              size={16} 
              weight={600} 
              style={styles.serviceTypeText}
              autoTranslate={false}
            >
              {item.serviceType}
            </Text>
            <Text 
              size={14} 
              color="grey70" 
              style={styles.dateText}
              autoTranslate={false}
            >
              Date: {formatDate(item.date)}
            </Text>
          </View>
          <Badge variant={variant}>{text}</Badge>
        </View>
      );
    });
  };

  const renderEmptyState = (message: string, subMessage: string) => (
    <View style={styles.noDataContainer}>
      <Text 
        size={14} 
        color="grey70" 
        style={styles.noDataText}
        autoTranslate={false}
      >
        {message}
      </Text>
      <Text 
        size={12} 
        color="grey70" 
        style={styles.noDataSubText}
        autoTranslate={false}
      >
        {subMessage}
      </Text>
    </View>
  );

  return (
    <CardWrapper>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text size={20} weight={800} style={styles.titleText} autoTranslate={false}>
            {cardContent.title}
          </Text>
          <Text 
            size={14} 
            color="grey70" 
            style={styles.descriptionText}
            autoTranslate={false}
          >
            {cardContent.description}
          </Text>
        </View>
        <View style={styles.iconContainer}>
          <Feather 
            name="calendar" 
            size={24} 
            color={mutedColor} 
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {type === 'all' ? (
          <>
            {/* Recent Maintenance Section */}
            <View style={styles.sectionContainer}>
              <Text size={18} weight={700} style={styles.sectionTitle} autoTranslate={false}>
                Recent Maintenance
              </Text>
              {initialData.filter(item => {
                const recordDate = new Date(item.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return recordDate.getTime() <= today.getTime();
              }).length > 0 ? (
                <View style={styles.maintenanceItemsContainer}>
                  {renderMaintenanceItems(initialData.filter(item => {
                    const recordDate = new Date(item.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return recordDate.getTime() <= today.getTime();
                  }))}
                </View>
              ) : (
                renderEmptyState("No recent maintenance found.", "Your completed services will appear here.")
              )}
            </View>

            {/* Upcoming Maintenance Section */}
            <View style={styles.sectionContainer}>
              <Text size={18} weight={700} style={styles.sectionTitle} autoTranslate={false}>
                Upcoming Maintenance
              </Text>
              {initialData.filter(item => {
                const recordDate = new Date(item.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return recordDate.getTime() > today.getTime();
              }).length > 0 ? (
                <View style={styles.maintenanceItemsContainer}>
                  {renderMaintenanceItems(initialData.filter(item => {
                    const recordDate = new Date(item.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return recordDate.getTime() > today.getTime();
                  }))}
                </View>
              ) : (
                renderEmptyState("No upcoming maintenance scheduled.", "Schedule your next service to see it here.")
              )}
            </View>
          </>
        ) : (
          /* Single type card content */
          filteredData.length > 0 ? (
            <View style={styles.maintenanceItemsContainer}>
              {renderMaintenanceItems(filteredData)}
            </View>
          ) : (
            renderEmptyState(cardContent.emptyMessage, cardContent.emptySubMessage)
          )
        )}
      </View>

      {/* Footer */}
      <View style={styles.buttonContainer}>
        <Button
          title="View Full Schedule"
          variant="outlined"
          onPress={handleViewFullSchedule}
          isFullWidth
          suffix={
            <Feather 
              name="chevron-right" 
              size={16} 
              color={COLORS.light.primary} 
            />
          }
        />
      </View>
    </CardWrapper>
  );
}

export default MaintenanceSchedule;
