import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Input, Button } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import { COLORS } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

export default function PersonalInformation() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Mahmoud',
    lastName: 'Salah',
    email: 'mahmoud.s.m619@gmail.com',
    phone: '+201005541537',
    dateOfBirth: '1995-01-15',
    address: '5th Settlement, Cairo',
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
    console.log('Saving personal information:', formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text size={24} weight={700} style={styles.title} autoTranslate={false}>
            Personal Information
          </Text>
          <Text size={14} color="grey70" style={styles.subtitle} autoTranslate={false}>
            Manage your personal details and contact information
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

      {/* Personal Details Card */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="user" size={20} color={COLORS.light.primary} />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Basic Information
          </Text>
        </View>

        <View style={styles.formGrid}>
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Input
                label="First Name"
                placeholder="Enter first name"
                value={formData.firstName}
                editable={isEditing}
                onChange={(text) => setFormData({...formData, firstName: text})}
              />
            </View>
            <View style={styles.inputHalf}>
              <Input
                label="Last Name"
                placeholder="Enter last name"
                value={formData.lastName}
                editable={isEditing}
                onChange={(text) => setFormData({...formData, lastName: text})}
              />
            </View>
          </View>

          <Input
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
            value={formData.dateOfBirth}
            editable={isEditing}
            onChange={(text) => setFormData({...formData, dateOfBirth: text})}
          />
        </View>
      </CardWrapper>

      {/* Contact Information Card */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="mail" size={20} color="#4ECDC4" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Contact Information
          </Text>
        </View>

        <View style={styles.formGrid}>
          <Input
            label="Email Address"
            placeholder="Enter email"
            value={formData.email}
            editable={isEditing}
            keyboardType="email-address"
            onChange={(text) => setFormData({...formData, email: text})}
          />

          <Input
            label="Phone Number"
            placeholder="Enter phone number"
            value={formData.phone}
            editable={isEditing}
            keyboardType="phone-pad"
            onChange={(text) => setFormData({...formData, phone: text})}
          />
        </View>
      </CardWrapper>

      {/* Address Information Card */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="map-pin" size={20} color="#FF8C94" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Address
          </Text>
        </View>

        <View style={styles.formGrid}>
          <Input
            label="Address"
            placeholder="Enter your address"
            value={formData.address}
            editable={isEditing}
            onChange={(text) => setFormData({...formData, address: text})}
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