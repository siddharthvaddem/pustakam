import { StyleSheet } from 'react-native';
import { colors, textStyles } from '../theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    ...textStyles.transcript,
    color: colors.textPending,
    textAlign: 'center',
  },
  emptyHint: {
    ...textStyles.label,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
