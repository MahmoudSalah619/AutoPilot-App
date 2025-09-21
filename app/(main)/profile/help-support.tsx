import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Text } from '@/components/atoms';
import CardWrapper from '@/components/wrappers/Card';
import { COLORS } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

export default function HelpSupport() {
  const router = useRouter();

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose your preferred contact method',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@autopilot.com') },
        { text: 'Phone', onPress: () => Linking.openURL('tel:+1234567890') }
      ]
    );
  };

  const handleOpenFAQ = () => {
    Alert.alert('FAQ', 'Opening frequently asked questions...');
  };

  const handleOpenUserGuide = () => {
    Alert.alert('User Guide', 'Opening comprehensive user guide...');
  };

  const handleReportBug = () => {
    Alert.alert(
      'Report Bug',
      'Describe the issue you encountered and we will investigate it.',
      [{ text: 'OK' }]
    );
  };

  const handleRequestFeature = () => {
    Alert.alert(
      'Feature Request',
      'Tell us about features you would like to see in AutoPilot.',
      [{ text: 'OK' }]
    );
  };

  const handleSystemDiagnostics = () => {
    Alert.alert(
      'System Diagnostics',
      'Running system diagnostics to check app health and performance...',
      [{ text: 'OK' }]
    );
  };

  const supportOptions = [
    {
      id: 1,
      title: 'Frequently Asked Questions',
      description: 'Find quick answers to common questions',
      icon: 'help-circle',
      color: COLORS.light.primary,
      onPress: handleOpenFAQ
    },
    {
      id: 2,
      title: 'User Guide',
      description: 'Complete guide on using AutoPilot features',
      icon: 'book',
      color: '#4ECDC4',
      onPress: handleOpenUserGuide
    },
    {
      id: 3,
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: 'headphones',
      color: '#FF8C94',
      onPress: handleContactSupport
    },
    {
      id: 4,
      title: 'Report a Bug',
      description: 'Report issues or unexpected behavior',
      icon: 'alert-circle',
      color: '#FFD93D',
      onPress: handleReportBug
    }
  ];

  const feedbackOptions = [
    {
      id: 1,
      title: 'Feature Request',
      description: 'Suggest new features for AutoPilot',
      icon: 'lightbulb',
      color: '#96CEB4',
      onPress: handleRequestFeature
    },
    {
      id: 2,
      title: 'System Diagnostics',
      description: 'Check app health and performance',
      icon: 'activity',
      color: '#A8E6CF',
      onPress: handleSystemDiagnostics
    }
  ];

  const quickActions = [
    {
      title: 'App Version',
      value: '2.1.3',
      icon: 'smartphone'
    },
    {
      title: 'Last Updated',
      value: 'Dec 15, 2023',
      icon: 'calendar'
    },
    {
      title: 'Support ID',
      value: 'AP-2023-789456',
      icon: 'hash'
    }
  ];

  const renderSupportOption = (option: typeof supportOptions[0]) => (
    <TouchableOpacity
      key={option.id}
      style={styles.supportOption}
      onPress={option.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.optionIcon, { backgroundColor: `${option.color}15` }]}>
        <Feather name={option.icon as any} size={20} color={option.color} />
      </View>
      <View style={styles.optionContent}>
        <Text size={16} weight={500} autoTranslate={false}>
          {option.title}
        </Text>
        <Text size={12} color="grey70" style={styles.optionDescription} autoTranslate={false}>
          {option.description}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={COLORS.light.grey70} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text size={24} weight={700} style={styles.title} autoTranslate={false}>
          Help & Support
        </Text>
        <Text size={14} color="grey70" style={styles.subtitle} autoTranslate={false}>
          Get assistance and find answers to your questions
        </Text>
      </View>

      {/* Support Options */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="life-buoy" size={20} color={COLORS.light.primary} />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Support Options
          </Text>
        </View>

        {supportOptions.map(renderSupportOption)}
      </CardWrapper>

      {/* Feedback & Diagnostics */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="message-circle" size={20} color="#4ECDC4" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Feedback & Diagnostics
          </Text>
        </View>

        {feedbackOptions.map(renderSupportOption)}
      </CardWrapper>

      {/* App Information */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="info" size={20} color="#96CEB4" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            App Information
          </Text>
        </View>

        {quickActions.map((action, index) => (
          <View key={index} style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <View style={[styles.infoIcon, { backgroundColor: `${COLORS.light.grey70}15` }]}>
                <Feather name={action.icon as any} size={16} color={COLORS.light.grey70} />
              </View>
              <Text size={14} color="grey70" autoTranslate={false}>
                {action.title}
              </Text>
            </View>
            <Text size={14} weight={500} autoTranslate={false}>
              {action.value}
            </Text>
          </View>
        ))}
      </CardWrapper>

      {/* Emergency Contact */}
      <CardWrapper customStyles={StyleSheet.flatten([styles.card, styles.emergencyCard])}>
        <View style={styles.cardHeader}>
          <Feather name="phone-call" size={20} color="#FF6B6B" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Emergency Support
          </Text>
        </View>

        <Text size={14} color="grey70" style={styles.emergencyDescription} autoTranslate={false}>
          For urgent technical issues that prevent you from using critical vehicle features
        </Text>

        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => Linking.openURL('tel:+1-800-AUTOPILOT')}
          activeOpacity={0.8}
        >
          <View style={styles.emergencyButtonContent}>
            <Feather name="phone" size={18} color="#FFFFFF" />
            <Text size={16} weight={600} style={[styles.emergencyButtonText, { color: '#FFFFFF' }]} autoTranslate={false}>
              Call Emergency Support
            </Text>
          </View>
          <Text size={12} style={[styles.emergencyNumber, { color: '#FFFFFF' }]} autoTranslate={false}>
            1-800-AUTOPILOT
          </Text>
        </TouchableOpacity>
      </CardWrapper>

      {/* Quick Tips */}
      <CardWrapper customStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="zap" size={20} color="#FFD93D" />
          <Text size={18} weight={600} style={styles.cardTitle} autoTranslate={false}>
            Quick Tips
          </Text>
        </View>

        <View style={styles.tipItem}>
          <View style={styles.tipBullet} />
          <Text size={14} style={styles.tipText} autoTranslate={false}>
            Try restarting the app if you experience any unexpected behavior
          </Text>
        </View>

        <View style={styles.tipItem}>
          <View style={styles.tipBullet} />
          <Text size={14} style={styles.tipText} autoTranslate={false}>
            Check your internet connection for the latest features and updates
          </Text>
        </View>

        <View style={styles.tipItem}>
          <View style={styles.tipBullet} />
          <Text size={14} style={styles.tipText} autoTranslate={false}>
            Keep location services enabled for accurate trip planning
          </Text>
        </View>
      </CardWrapper>

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
  emergencyCard: {
    borderWidth: 1,
    borderColor: '#FF6B6B20',
    backgroundColor: '#FF6B6B05',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionDescription: {
    marginTop: 2,
    lineHeight: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  emergencyDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emergencyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emergencyButtonText: {
    marginLeft: 8,
  },
  emergencyNumber: {
    opacity: 0.9,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD93D',
    marginTop: 5,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    lineHeight: 20,
    color: COLORS.light.grey70,
  },
  bottomSpacing: {
    height: 32,
  },
});