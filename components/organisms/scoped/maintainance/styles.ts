import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  titleText: {
    marginBottom: 4,
  },
  descriptionText: {
    lineHeight: 20,
  },
  iconContainer: {
    marginLeft: 16,
  },
  contentContainer: {
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  noDataSubText: {
    textAlign: 'center',
  },
  maintenanceItemsContainer: {
    gap: 16,
  },
  maintenanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.light.greyF5,
  },
  maintenanceItemContent: {
    flex: 1,
  },
  serviceTypeText: {
    marginBottom: 4,
  },
  dateText: {
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 16,
  },
});

export default styles;