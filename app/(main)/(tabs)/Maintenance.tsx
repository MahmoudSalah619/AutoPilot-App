import MainScreenWrapper from '@/components/templates/MainScreenWrapper';
import MaintenanceSchedule from '@/components/organisms/scoped/maintainance';
import { MaintenanceRecord } from '@/@types/maintenance';
import React, { useState } from 'react';
import { Button, Text } from '@/components/atoms';
import AddMaintenanceModal from '@/components/organisms/common/modals/addMaintainance';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/Colors';

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

const Maintenance = () => {
  const [isUpdateModalVisible, setisUpdateModalVisible] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState<any | null>(null);
  const handleAddEntry = () => {
    setisUpdateModalVisible(true);
  };
  return (
    <MainScreenWrapper isScrollable>
      <TouchableOpacity style={styles.addButton} onPress={handleAddEntry}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
      {isUpdateModalVisible && (
        <AddMaintenanceModal
          isVisible={isUpdateModalVisible}
          setVisible={setisUpdateModalVisible}
          onSubmit={(data) => {
            setNewMaintenance(data);
            setisUpdateModalVisible(false);
          }}
        />
      )}
      {sampleMaintenanceData.length > 0 ? (
        <>
          <MaintenanceSchedule initialData={sampleMaintenanceData} type="upcoming" />
          <MaintenanceSchedule initialData={sampleMaintenanceData} type="recent" />
        </>
      ) : (
        <>
          <Text size={24} weight={800} isCentered>
            oops, no maintenance records found.
          </Text>
          <Text size={24} weight={800} isCentered>
            حط حجتك هنا يا معرص
          </Text>
          <Button
            onPress={() => {
              setisUpdateModalVisible(true);
            }}
            title="حط ايدك هنا كده"
          />
          {newMaintenance && (
            <Text size={16} weight={600} isCentered>
              Last submitted: {JSON.stringify(newMaintenance)}
            </Text>
          )}
        </>
      )}
    </MainScreenWrapper>
  );
};
const styles = {
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
    zIndex: 1000,
  },
};
export default Maintenance;
