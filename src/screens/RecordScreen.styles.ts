import { StyleSheet } from 'react-native';
import { colors, textStyles } from '../theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  controls: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  status: {
    ...textStyles.label,
    color: colors.textMuted,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  error: {
    color: colors.danger,
    textTransform: 'none',
  },
  // Keeps the last line of text clear of the check button while typing.
  keyboardSpacer: {
    height: 64,
  },
});
