import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { Text } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import { COLORS } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

export default function AboutAutoPilot() {
  const router = useRouter();

  const handleVisitWebsite = () => {
    Linking.openURL('https://www.autopilot.com');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://www.autopilot.com/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://www.autopilot.com/terms');
  };

  const handleLicenses = () => {
    Linking.openURL('https://www.autopilot.com/licenses');
  };

  const appInfo = [
    { label: 'Version', value: '2.1.3' },
    { label: 'Build', value: '2023.12.15.1' },
    { label: 'Platform', value: 'React Native' },
    { label: 'Release Date', value: 'December 15, 2023' }
  ];

  const features = [
    {
      icon: 'calendar',
      title: 'Smart Scheduling',
      description: 'AI-powered maintenance scheduling and reminders'
    },
    {
      icon: 'map-pin',
      title: 'Location Services',
      description: 'Find nearby service centers and charging stations'
    },
    {
      icon: 'shield',
      title: 'Security First',
      description: 'End-to-end encryption for all your vehicle data'
    },
    {
      icon: 'zap',
      title: 'Real-time Updates',
      description: 'Live vehicle status and performance monitoring'
    }
  ];

  const teamMembers = [
    { name: 'Development Team', role: 'Software Engineering' },
    { name: 'Design Team', role: 'User Experience' },
    { name: 'QA Team', role: 'Quality Assurance' },
    { name: 'Support Team', role: 'Customer Success' }
  ];

  const legalLinks = [
    {
      title: 'Privacy Policy',
      description: 'How we protect and use your data',
      onPress: handlePrivacyPolicy
    },
    {
      title: 'Terms of Service',
      description: 'Agreement for using AutoPilot services',
      onPress: handleTermsOfService
    },
    {
      title: 'Open Source Licenses',
      description: 'Third-party libraries and their licenses',
      onPress: handleLicenses
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text size={24} weight={700} style={styles.title} autoTranslate={false}>
          About AutoPilot
        </Text>
        <Text size={14} color="grey70" style={styles.subtitle} autoTranslate={false}>
          Learn more about our app and company
        </Text>
      </View>

      {/* App Overview */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/auto-pilot.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text size={20} weight={600} style={styles.appName} autoTranslate={false}>
            AutoPilot
          </Text>
          <Text size={14} color="grey70" style={styles.tagline} autoTranslate={false}>
            Your intelligent vehicle companion
          </Text>
        </View>

        <Text size={14} style={styles.description} autoTranslate={false}>
          AutoPilot is designed to simplify your vehicle management experience. 
          From maintenance scheduling to service tracking, we provide intelligent 
          solutions that keep your vehicle running at peak performance.
        </Text>
      </CardWrapper>

      {/* App Information */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="info" size={20} color={COLORS.light.primary} />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            App Information
          </Text>
        </View>

        {appInfo.map((info, index) => (
          <View key={index} style={styles.infoRow}>
            <Text size={14} color="grey70" autoTranslate={false}>
              {info.label}
            </Text>
            <Text size={14} weight={500} autoTranslate={false}>
              {info.value}
            </Text>
          </View>
        ))}
      </CardWrapper>

      {/* Key Features */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="star" size={20} color="#FFD93D" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Key Features
          </Text>
        </View>

        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${COLORS.light.primary}15` }]}>
              <Feather name={feature.icon as any} size={18} color={COLORS.light.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text size={15} weight={500} style={styles.featureTitle} autoTranslate={false}>
                {feature.title}
              </Text>
              <Text size={12} color="grey70" style={styles.featureDescription} autoTranslate={false}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </CardWrapper>

      {/* Development Team */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="users" size={20} color="#4ECDC4" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Development Team
          </Text>
        </View>

        <Text size={14} color="grey70" style={styles.teamDescription} autoTranslate={false}>
          AutoPilot is built by a passionate team of engineers, designers, and automotive enthusiasts.
        </Text>

        {teamMembers.map((member, index) => (
          <View key={index} style={styles.teamMember}>
            <View style={styles.teamIcon}>
              <Feather name="user" size={16} color={COLORS.light.grey70} />
            </View>
            <View style={styles.teamInfo}>
              <Text size={14} weight={500} autoTranslate={false}>
                {member.name}
              </Text>
              <Text size={12} color="grey70" autoTranslate={false}>
                {member.role}
              </Text>
            </View>
          </View>
        ))}
      </CardWrapper>

      {/* Legal & Compliance */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="file-text" size={20} color="#96CEB4" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Legal & Compliance
          </Text>
        </View>

        {legalLinks.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={styles.legalLink}
            onPress={link.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.legalContent}>
              <Text size={15} weight={500} autoTranslate={false}>
                {link.title}
              </Text>
              <Text size={12} color="grey70" style={styles.legalDescription} autoTranslate={false}>
                {link.description}
              </Text>
            </View>
            <Feather name="external-link" size={16} color={COLORS.light.grey70} />
          </TouchableOpacity>
        ))}
      </CardWrapper>

      {/* Contact & Social */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="globe" size={20} color="#FF8C94" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Stay Connected
          </Text>
        </View>

        <TouchableOpacity
          style={styles.websiteButton}
          onPress={handleVisitWebsite}
          activeOpacity={0.8}
        >
          <View style={styles.websiteContent}>
            <Feather name="globe" size={18} color={COLORS.light.primary} />
            <Text size={16} weight={500} style={styles.websiteText} autoTranslate={false}>
              Visit Our Website
            </Text>
          </View>
          <Feather name="external-link" size={16} color={COLORS.light.grey70} />
        </TouchableOpacity>

        <View style={styles.socialSection}>
          <Text size={14} color="grey70" style={styles.socialTitle} autoTranslate={false}>
            Follow us for updates and news
          </Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Feather name="twitter" size={20} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Feather name="facebook" size={20} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Feather name="linkedin" size={20} color="#0A66C2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Feather name="instagram" size={20} color="#E4405F" />
            </TouchableOpacity>
          </View>
        </View>
      </CardWrapper>

      {/* Copyright */}
      <View style={styles.footer}>
        <Text size={12} color="grey70" style={styles.copyright} autoTranslate={false}>
          © 2023 AutoPilot Technologies Inc.
        </Text>
        <Text size={12} color="grey70" style={styles.copyright} autoTranslate={false}>
          All rights reserved.
        </Text>
      </View>

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
    marginBottom: 24,
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: `${COLORS.light.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 50,
    height: 50,
  },
  appName: {
    marginBottom: 4,
  },
  tagline: {
    textAlign: 'center',
  },
  description: {
    lineHeight: 22,
    textAlign: 'center',
    color: COLORS.light.grey70,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    marginBottom: 2,
  },
  featureDescription: {
    lineHeight: 16,
  },
  teamDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${COLORS.light.grey70}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  teamInfo: {
    flex: 1,
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  legalContent: {
    flex: 1,
  },
  legalDescription: {
    marginTop: 2,
    lineHeight: 16,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${COLORS.light.primary}10`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  websiteContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  websiteText: {
    marginLeft: 8,
    color: COLORS.light.primary,
  },
  socialSection: {
    alignItems: 'center',
  },
  socialTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  socialLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.light.greyF5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  copyright: {
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 32,
  },
});