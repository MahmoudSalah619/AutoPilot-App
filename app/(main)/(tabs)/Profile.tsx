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

  const profileSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'user',
          title: 'Personal Information',
          subtitle: 'Manage your personal details',
          color: COLORS.light.primary,
          onPress: () => router.push('/(main)/profile/personal-information'),
        },
        {
          icon: 'truck',
          title: 'Vehicle Information',
          subtitle: 'Your car details and preferences',
          color: '#4ECDC4',
          onPress: () => router.push('/(main)/profile/vehicle-information'),
        },
        {
          icon: 'bell',
          title: 'Notifications',
          subtitle: 'Manage your notification preferences',
          color: '#45B7D1',
          onPress: () => router.push('/(main)/profile/notifications'),
        },
      ]
    },
    {
      title: 'Settings',
      items: [
        {
          icon: 'globe',
          title: 'Language',
          subtitle: 'English',
          color: '#96CEB4',
          onPress: () => {
            Alert.alert(
              'Select Language',
              'Choose your preferred language',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'English', onPress: () => changeLanguage('en') },
                { text: 'العربية', onPress: () => changeLanguage('ar') }
              ]
            );
          },
        },
        {
          icon: 'shield',
          title: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          color: '#FF8C94',
          onPress: () => router.push('/(main)/profile/privacy-security'),
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle',
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          color: '#FFD93D',
          onPress: () => router.push('/(main)/profile/help-support'),
        },
        {
          icon: 'info',
          title: 'About AutoPilot',
          subtitle: 'App version and information',
          color: '#A8E6CF',
          onPress: () => router.push('/(main)/profile/about-autopilot'),
        },
      ]
    },
    {
      title: '',
      items: [
        {
          icon: 'log-out',
          title: 'Logout',
          subtitle: 'Sign out of your account',
          color: '#FF6B6B',
          onPress: handleLogout,
          showArrow: false,
        },
      ]
    }
  ] as const;

  return (
    <MainScreenWrapper isScrollable>
      <ProfileHeader 
        name="Mahmoud Salah"
        email="mahmoud.s.m619@gmail.com"
        onEditPress={handleEditProfile}
      />

      {profileSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          {section.title ? (
            <Text size={18} weight={600} style={styles.sectionTitle} autoTranslate={false}>
              {section.title}
            </Text>
          ) : null}
          
          {section.items.map((item, itemIndex) => (
            <ProfileItem
              key={itemIndex}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              color={item.color}
              onPress={item.onPress}
              showArrow={'showArrow' in item ? item.showArrow : undefined}
            />
          ))}
        </View>
      ))}
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
