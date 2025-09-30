import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 120,
    padding: 16,
    backgroundColor: COLORS.light.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.light.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  titleText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  descriptionText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default styles;