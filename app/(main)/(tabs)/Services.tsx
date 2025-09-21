import React from 'react';
import { FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { Text } from '@/components/atoms';
import MainScreenWrapper from '@/components/templates/MainScreenWrapper';
import ServiceCard from '@/components/molecules/scoped/ServiceCard';
import { COLORS } from '@/constants/Colors';

interface ServiceData {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
}

const Services = () => {
  const handleServicePress = (serviceName: string) => {
    console.log(`${serviceName} service pressed`);
    // Navigate to specific service screen
    // router.push(`/services/${serviceName.toLowerCase().replace(' ', '-')}`);
  };

  const servicesData: ServiceData[] = [
    {
      id: '1',
      title: 'Gas Consumption',
      description: 'Track and analyze your fuel efficiency',
      iconName: 'zap',
      color: COLORS.light.primary,
    },
    {
      id: '2',
      title: 'Errors Guide',
      description: 'Diagnose and fix vehicle errors',
      iconName: 'alert-triangle',
      color: '#FF6B6B',
    },
    {
      id: '3',
      title: 'Vehicle Documents',
      description: 'Store and manage your car papers',
      iconName: 'file-text',
      color: '#4ECDC4',
    },
    {
      id: '4',
      title: 'Service Reminders',
      description: 'Never miss a maintenance date',
      iconName: 'bell',
      color: '#45B7D1',
    },
    {
      id: '5',
      title: 'Climate & Comfort',
      description: 'A/C, heating, and cabin air quality',
      iconName: 'thermometer',
      color: '#FF8C94',
    },
    {
      id: '6',
      title: 'Roadtrip Planner',
      description: 'Plan your perfect journey',
      iconName: 'map',
      color: '#96CEB4',
    },
  ];

  const renderServiceCard: ListRenderItem<ServiceData> = ({ item }) => (
    <ServiceCard
      title={item.title}
      description={item.description}
      iconName={item.iconName}
      color={item.color}
      onPress={() => handleServicePress(item.title)}
    />
  );

  return (
    <MainScreenWrapper isScrollable>
      <Text size={24} weight={700} isCentered style={styles.headerTitle}>
        Vehicle Services
      </Text>

      <Text size={14} color="grey70" isCentered style={styles.headerSubtitle} autoTranslate={false}>
        Access all your vehicle management tools in one place
      </Text>

      <FlatList
        data={servicesData}
        renderItem={renderServiceCard}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.servicesGrid}
        scrollEnabled={false} // Disable FlatList scroll since MainScreenWrapper handles it
      />
    </MainScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    marginBottom: 8,
  },
  headerSubtitle: {
    marginBottom: 24,
    lineHeight: 20,
  },
  servicesGrid: {
    gap: 16, // Vertical gap between rows
  },
  row: {
    gap: 12, // Horizontal gap between cards in each row
    justifyContent: 'space-between',
  },
});

export default Services;
