import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '@/constants/Colors';

const { height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    maxHeight: screenHeight * 0.75, // Limit modal to 75% of screen height
    width: '100%',
  },
  modalContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.light.greyF5,
    borderWidth: 1,
    borderColor: COLORS.light.greyCC,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  activeOptionButton: {
    backgroundColor: COLORS.light.primary,
    borderColor: COLORS.light.primary,
  },
  buttonContainer: {
    gap: 10,
    marginTop: 12,
  },
});

export default styles;