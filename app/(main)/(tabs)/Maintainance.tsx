import { Input, Text } from '@/components/atoms';
import MainScreenWrapper from '@/components/templates/MainScreenWrapper';
import MaintenanceSchedule from '@/components/organisms/scoped/maintainance';
import { MaintenanceRecord } from '@/@types/maintenance';
import React from 'react';

// Sample data for demonstration
const sampleMaintenanceData: MaintenanceRecord[] = [
  // Recent (completed) maintenance
  {
    id: '1',
    serviceType: 'Oil Change',
    date: '2025-09-15',
  },
  {
    id: '2',
    serviceType: 'Tire Rotation',
    date: '2025-08-20',
  },
  {
    id: '3',
    serviceType: 'Brake Inspection',
    date: '2025-07-10',
  },
  // Upcoming maintenance
  {
    id: '4',
    serviceType: 'Engine Tune-up',
    date: '2025-10-15',
  },
  {
    id: '5',
    serviceType: 'Air Filter Replacement',
    date: '2025-11-01',
  },
  {
    id: '6',
    serviceType: 'Coolant Check',
    date: '2025-12-05',
  },
];

const Maintainance = () => {
  return (
    <MainScreenWrapper isScrollable>
      {/* <Text size={24} weight={700} isCentered>
        Vehicle Maintenance
      </Text> */}

      <MaintenanceSchedule initialData={sampleMaintenanceData} type="upcoming" />
      <MaintenanceSchedule initialData={sampleMaintenanceData} type="recent" />
    </MainScreenWrapper>
  );
};

export default Maintainance;
