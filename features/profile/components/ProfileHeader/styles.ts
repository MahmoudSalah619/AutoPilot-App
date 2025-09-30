import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.light.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: COLORS.light.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    marginBottom: 4,
  },
  email: {
    marginBottom: 16,
    lineHeight: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.light.greyE5,
    borderRadius: 20,
  },
  editText: {
    marginLeft: 6,
  },
});

export default styles;