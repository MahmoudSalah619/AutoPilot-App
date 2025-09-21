import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Text } from '@/components/atoms';
import MainScreenWrapper from '@/components/templates/MainScreenWrapper';
import ProfileHeader from '@/components/molecules/scoped/ProfileHeader';
import ProfileItem from '@/components/molecules/scoped/ProfileItem';
import { COLORS } from '@/constants/Colors';
import i18n from '@/locale';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => router.replace('/(auth)/welcome')
        }
      ]
    );
  };

  const changeLanguage = async (lang: 'en' | 'ar') => {
    try {
      await i18n.changeLanguage(lang);
    } catch (error) {
      console.error('Language change failed', error);
    }
  };

  const handleEditProfile = () => {
    console.log('Edit profile pressed');
    // Navigate to edit profile screen
  };

  const handlePersonalInfo = () => {
    console.log('Personal info pressed');
    // Navigate to personal info screen
  };

  const handleVehicleInfo = () => {
    console.log('Vehicle info pressed');
    // Navigate to vehicle info screen
  };

  const handleNotifications = () => {
    console.log('Notifications pressed');
    // Navigate to notifications settings
  };

  const handlePrivacy = () => {
    console.log('Privacy pressed');
    // Navigate to privacy settings
  };

  const handleSupport = () => {
    console.log('Support pressed');
    // Navigate to support/help screen
  };

  const handleAbout = () => {
    console.log('About pressed');
    // Navigate to about screen
  };

  return (
    <MainScreenWrapper isScrollable>
      <ProfileHeader 
        name="Mahmoud Salah"
        email="mahmoud.s.m619@gmail.com"
        onEditPress={handleEditProfile}
      />

      {/* Account Section */}
      <View style={styles.section}>
        <Text size={18} weight={600} style={styles.sectionTitle} autoTranslate={false}>
          Account
        </Text>
        
        <ProfileItem
          icon="user"
          title="Personal Information"
          subtitle="Manage your personal details"
          color={COLORS.light.primary}
          onPress={handlePersonalInfo}
        />
        
        <ProfileItem
          icon="truck"
          title="Vehicle Information"
          subtitle="Your car details and preferences"
          color="#4ECDC4"
          onPress={handleVehicleInfo}
        />
        
        <ProfileItem
          icon="bell"
          title="Notifications"
          subtitle="Manage your notification preferences"
          color="#45B7D1"
          onPress={handleNotifications}
        />
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text size={18} weight={600} style={styles.sectionTitle} autoTranslate={false}>
          Settings
        </Text>
        
        <ProfileItem
          icon="globe"
          title="Language"
          subtitle="English"
          color="#96CEB4"
          onPress={() => {
            Alert.alert(
              'Select Language',
              'Choose your preferred language',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'English', onPress: () => changeLanguage('en') },
                { text: 'العربية', onPress: () => changeLanguage('ar') }
              ]
            );
          }}
        />
        
        <ProfileItem
          icon="shield"
          title="Privacy & Security"
          subtitle="Manage your privacy settings"
          color="#FF8C94"
          onPress={handlePrivacy}
        />
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text size={18} weight={600} style={styles.sectionTitle} autoTranslate={false}>
          Support
        </Text>
        
        <ProfileItem
          icon="help-circle"
          title="Help & Support"
          subtitle="Get help and contact support"
          color="#FFD93D"
          onPress={handleSupport}
        />
        
        <ProfileItem
          icon="info"
          title="About AutoPilot"
          subtitle="App version and information"
          color="#A8E6CF"
          onPress={handleAbout}
        />
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <ProfileItem
          icon="log-out"
          title="Logout"
          subtitle="Sign out of your account"
          color="#FF6B6B"
          onPress={handleLogout}
          showArrow={false}
        />
      </View>
    </MainScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    // marginBottom: 4,
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 4,
  },
});
