import { Dimensions, StyleSheet } from 'react-native';
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
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
  },
  ctaButton: {
    borderRadius: 16,
    marginBottom: 12,
    width: '100%',
  },
  ctaSubtext: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
