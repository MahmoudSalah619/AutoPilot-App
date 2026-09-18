import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
