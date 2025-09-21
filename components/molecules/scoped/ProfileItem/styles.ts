import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.light.white,
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: COLORS.light.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    lineHeight: 18,
  },
  arrowContainer: {
    marginLeft: 8,
  },
});

export default styles;