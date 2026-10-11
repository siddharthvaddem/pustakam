import { StyleSheet } from 'react-native';
import { colors, textStyles } from '../../theme';

export const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  // Absolutely centered, so it stays in the middle no matter what's on the left.
  title: {
    ...textStyles.title,
    color: colors.text,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
});
