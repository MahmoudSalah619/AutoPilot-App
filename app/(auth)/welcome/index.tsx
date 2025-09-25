import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, Image, Logo } from '@/components/atoms';
import AuthScreenWrapper from '@/components/templates/AuthScreenWrapper';

const { width } = Dimensions.get('window');

const Welcome = () => {
  const router = useRouter();

  const FeatureCard = ({
    icon,
    title,
    description,
  }: {
    icon: string;
    title: string;
    description: string;
  }) => (
    <View style={styles.featureCard}>
      <View style={styles.iconContainer}>
        <Text size={24}>{icon}</Text>
      </View>
      <View style={styles.featureContent}>
        <Text size={16} weight={600} style={styles.featureTitle}>
          {title}
        </Text>
        <Text size={14} color="grey70" lineHeight={20} style={styles.featureDesc}>
          {description}
        </Text>
      </View>
    </View>
  );

  return (
    <AuthScreenWrapper paddingSize="sm" isScrollable showHeader={false}>
      <View style={styles.container}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.gradientBackground}>
            <View style={styles.heroImageContainer}>
             <Logo width={180} height={100} />
            </View>

            <View style={styles.titleSection}>
              <Text size={32} weight={800} style={styles.welcomeText}>
                Welcome to
              </Text>
              <Text size={36} weight={800} color="primary" style={styles.brandText}>
                AutoPilot
              </Text>
            </View>

            <Text color="grey70" lineHeight={24} size={16} style={styles.heroDesc}>
              Your intelligent car maintenance companion.
            </Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text size={24} weight={700} style={styles.sectionTitle}>
            Why Choose AutoPilot?
          </Text>

          <View style={styles.featuresContainer}>
            <FeatureCard
              icon="📊"
              title="Smart Tracking"
              description="Monitor your car's kilometers and get precise maintenance schedules."
            />

            <FeatureCard
              icon="⚡"
              title="Instant Reminders"
              description="Never miss important maintenance with intelligent notifications."
            />

            <FeatureCard
              icon="💰"
              title="Save Money"
              description="Prevent costly repairs by staying ahead of maintenance needs."
            />

            <FeatureCard
              icon="🛡️"
              title="Peace of Mind"
              description="Drive confidently knowing your car is always well-maintained."
            />
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Button
            title="Get Started"
            onPress={() => router.push('/(auth)/login')}
            buttonStyle={styles.ctaButton}
            showShadow={true}
            btnHeight={56}
            isFullWidth={true}
          />

          <Text size={12} color="grey70" style={styles.ctaSubtext}>
            Join thousands of drivers who trust AutoPilot
          </Text>
        </View>
      </View>
    </AuthScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },

  // Hero Section
  heroSection: {
    marginBottom: 40,
  },
  gradientBackground: {
    backgroundColor: 'rgba(70, 130, 194, 0.08)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(70, 130, 194, 0.15)',
  },
  heroImageContainer: {
    marginBottom: 20,
  },
  heroImage: {
    width: width * 0.4,
    height: width * 0.25,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  brandText: {
    textAlign: 'center',
  },
  heroDesc: {
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  // Features Section
  featuresSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  featuresContainer: {
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(70, 130, 194, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    marginBottom: 4,
    color: '#333',
  },
  featureDesc: {
    lineHeight: 20,
  },

  // CTA Section
  ctaSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  ctaButton: {
    borderRadius: 16,
    marginBottom: 12,
  },
  ctaSubtext: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default Welcome;
