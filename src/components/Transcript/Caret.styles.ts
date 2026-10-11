import { StyleSheet } from 'react-native';
import { colors, textStyles } from '../../theme';

export const styles = StyleSheet.create({
  caret: {
    width: 2,
    height: textStyles.transcript.fontSize * 1.1,
    borderRadius: 1,
    backgroundColor: colors.accent,
  },
});
