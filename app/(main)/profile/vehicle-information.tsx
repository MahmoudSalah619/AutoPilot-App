import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Input, Button } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import { COLORS } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

export default function VehicleInformation() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    make: 'Toyota',
    model: 'Camry',
    year: '2020',
    color: 'Silver',
    plateNumber: 'ABC-1234',
    vinNumber: '1HGBH41JXMN109186',
    mileage: '45,000',
    fuelType: 'Gasoline',
    engineSize: '2.5L',
    transmission: 'Automatic',
  });

  const handleSave = () => {
    setIsEditing(false);
    console.log('Saving vehicle information:', vehicleData);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const fuelTypes = ['Gasoline', 'Diesel', 'Hybrid', 'Electric'];
  const transmissionTypes = ['Manual', 'Automatic', 'CVT'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text size={24} weight={700} style={styles.title} autoTranslate={false}>
            Vehicle Information
          </Text>
          <Text size={14} color="grey70" style={styles.subtitle} autoTranslate={false}>
            Manage your vehicle details and specifications
          </Text>
        </View>
        
        {!isEditing && (
          <Button
            title="Edit"
            variant="outlined"
            onPress={() => setIsEditing(true)}
            prefix={<Feather name="edit-2" size={16} color={COLORS.light.primary} />}
          />
        )}
      </View>

      {/* Vehicle Overview Card */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="truck" size={20} color="#4ECDC4" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Vehicle Overview
          </Text>
        </View>

        <View style={styles.vehicleDisplay}>
          <View style={styles.vehicleIcon}>
            <Feather name="truck" size={40} color={COLORS.light.primary} />
          </View>
          <View style={styles.vehicleInfo}>
            <Text size={20} weight={700} autoTranslate={false}>
              {vehicleData.year} {vehicleData.make} {vehicleData.model}
            </Text>
            <Text size={14} color="grey70" autoTranslate={false}>
              {vehicleData.color} • {vehicleData.mileage} miles
            </Text>
          </View>
        </View>
      </CardWrapper>

      {/* Basic Vehicle Info */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="info" size={20} color={COLORS.light.primary} />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Basic Information
          </Text>
        </View>

        <View style={styles.formGrid}>
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Input
                label="Make"
                placeholder="Vehicle make"
                value={vehicleData.make}
                editable={isEditing}
                onChange={(text) => setVehicleData({...vehicleData, make: text})}
              />
            </View>
            <View style={styles.inputHalf}>
              <Input
                label="Model"
                placeholder="Vehicle model"
                value={vehicleData.model}
                editable={isEditing}
                onChange={(text) => setVehicleData({...vehicleData, model: text})}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Input
                label="Year"
                placeholder="Year"
                value={vehicleData.year}
                editable={isEditing}
                keyboardType="numeric"
                onChange={(text) => setVehicleData({...vehicleData, year: text})}
              />
            </View>
            <View style={styles.inputHalf}>
              <Input
                label="Color"
                placeholder="Vehicle color"
                value={vehicleData.color}
                editable={isEditing}
                onChange={(text) => setVehicleData({...vehicleData, color: text})}
              />
            </View>
          </View>
        </View>
      </CardWrapper>

      {/* Registration & ID */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="file-text" size={20} color="#FF8C94" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Registration & Identification
          </Text>
        </View>

        <View style={styles.formGrid}>
          <Input
            label="License Plate Number"
            placeholder="Enter plate number"
            value={vehicleData.plateNumber}
            editable={isEditing}
            onChange={(text) => setVehicleData({...vehicleData, plateNumber: text})}
          />

          <Input
            label="VIN Number"
            placeholder="Enter VIN number"
            value={vehicleData.vinNumber}
            editable={isEditing}
            onChange={(text) => setVehicleData({...vehicleData, vinNumber: text})}
          />
        </View>
      </CardWrapper>

      {/* Technical Specifications */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="settings" size={20} color="#96CEB4" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Technical Specifications
          </Text>
        </View>

        <View style={styles.formGrid}>
          <Input
            label="Current Mileage"
            placeholder="Enter mileage"
            value={vehicleData.mileage}
            editable={isEditing}
            keyboardType="numeric"
            onChange={(text) => setVehicleData({...vehicleData, mileage: text})}
          />

          <Input
            label="Engine Size"
            placeholder="Enter engine size"
            value={vehicleData.engineSize}
            editable={isEditing}
            onChange={(text) => setVehicleData({...vehicleData, engineSize: text})}
          />

          <Input
            label="Fuel Type"
            placeholder="Select fuel type"
            value={vehicleData.fuelType}
            editable={isEditing}
            onChange={(text) => setVehicleData({...vehicleData, fuelType: text})}
          />

          <Input
            label="Transmission"
            placeholder="Select transmission"
            value={vehicleData.transmission}
            editable={isEditing}
            onChange={(text) => setVehicleData({...vehicleData, transmission: text})}
          />
        </View>
      </CardWrapper>

      {/* Action Buttons */}
      {isEditing && (
        <View style={styles.actionButtons}>
          <Button
            title="Cancel"
            variant="outlined"
            onPress={handleCancel}
            isFullWidth={false}
            buttonStyle={styles.button}
          />
          <Button
            title="Save Changes"
            variant="filled"
            onPress={handleSave}
            isFullWidth={false}
            buttonStyle={styles.button}
          />
        </View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 20,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
  },
  vehicleDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.light.greyE5,
    borderRadius: 12,
  },
  vehicleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.light.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  formGrid: {
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
  bottomSpacing: {
    height: 32,
  },
});