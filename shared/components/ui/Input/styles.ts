import { StyleSheet } from 'react-native';
import { SPACING } from '@/constants/Layout';

export default StyleSheet.create({
  wrapper: {
    rowGap: SPACING.xs,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
  },
  field: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: SPACING.md,
  },
  multilineField: {
    alignItems: 'flex-start',
    minHeight: 112,
    paddingVertical: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  multilineInput: {
    height: 88,
    textAlignVertical: 'top',
  },
  adornment: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
