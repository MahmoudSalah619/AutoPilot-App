import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: COLORS.light.background,
  },
  modalContent: {
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 10,
  },
  filterSection: {
    // gap: 12,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  errorText: {
    marginTop: 4,
  },
  buttonContainer: {
    gap: 8,
    marginTop: 10,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: COLORS.light.grey70,
    backgroundColor: 'transparent',
  },
  applyButton: {
    backgroundColor: COLORS.light.primary,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
});

export default styles;