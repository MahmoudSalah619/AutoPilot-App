import { StyleSheet } from 'react-native';
import { COLORS, ZenithColors } from '@/constants/Colors';
import { theme } from '@/utils/getTheme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },

  // Brand Header
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 20,
    gap: 8,
  },
  brandHeaderText: {
    color: '#261813',
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#261813',
    lineHeight: 40,
  },
  heroDesc: {
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 24,
    color: '#57534E',
  },

  // CTA Section
  ctaSection: {
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: 8,
  },
  ctaButton: {
    borderRadius: 12,
    width: '100%',
  },

  // Features Section
  featuresSection: {
    marginBottom: 20,
  },
  featuresContainer: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#FAFAF9',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS[theme].brand.borderSoft,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS[theme].brand.borderSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    marginBottom: 8,
    color: '#261813',
    textAlign: 'center',
  },
  featureDesc: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
