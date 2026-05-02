import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { styles } from './styles';
import { AuthScreenWrapper, Button, Text } from '@/shared';
import { COLORS } from '@/constants/Colors';
import { theme } from '@/utils/getTheme';

const Welcome = () => {
  const router = useRouter();

  const FeatureCard = ({
    icon,
    title,
    description,
  }: {
    icon: keyof typeof Feather.glyphMap;
    title: string;
    description: string;
  }) => (
    <View style={styles.featureCard}>
      <View style={styles.iconContainer}>
        <Feather name={icon} size={24} color={COLORS[theme].brand.highEnergyPrimary} />
      </View>
      <Text size={18} weight={600} style={styles.featureTitle}>
        {title}
      </Text>
      <Text size={14} color="grey70" style={styles.featureDesc}>
        {description}
      </Text>
    </View>
  );

  return (
    <AuthScreenWrapper paddingSize="sm" isScrollable showHeader={false}>
      <View style={styles.container}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Feather 
            name="activity" 
            size={22} 
            color={COLORS[theme].brand.highEnergyPrimary} 
          />
          <Text size={26} weight={700} style={styles.brandHeaderText}>
            AutoPilot
          </Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text size={32} weight={800} style={styles.heroTitle}>
            Simplify Your Journey
          </Text>
          <Text size={16} color="grey70" style={styles.heroDesc}>
            Experience calm automation for your vehicle. We handle the maintenance tracking and reminders, so you can enjoy the drive.
          </Text>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Button
            title="Get Started"
            onPress={() => router.push('/(auth)/login')}
            buttonStyle={styles.ctaButton}
            backgroundColor={COLORS[theme].brand.statusOverdueBg}
            showShadow={true}
            btnHeight={56}
            isFullWidth={true}
            suffix={<Feather name="arrow-right" size={20} color="white" />}
          />
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresContainer}>
            <FeatureCard
              icon="activity"
              title="Predictive Maintenance"
              description="Stay ahead of repairs with AI-driven insights tailored to your vehicle's history."
            />
            <FeatureCard
              icon="bell"
              title="Smart Alerts"
              description="Receive timely, unobtrusive notifications only when it truly matters."
            />
            <FeatureCard
              icon="file-text"
              title="Effortless Logging"
              description="Automatically record services and expenses without touching a spreadsheet."
            />
          </View>
        </View>
      </View>
    </AuthScreenWrapper>
  );
};

export default Welcome;
