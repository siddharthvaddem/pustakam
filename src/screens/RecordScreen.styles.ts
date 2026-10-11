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
  editingBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  doneButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  doneText: {
    ...textStyles.label,
    color: colors.accent,
    textTransform: 'uppercase',
  },
});
