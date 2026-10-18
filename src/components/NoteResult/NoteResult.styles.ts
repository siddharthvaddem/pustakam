import { StyleSheet } from 'react-native';
import { colors, fonts, textStyles } from '../../theme';

export const styles = StyleSheet.create({
  card: {
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  when: {
    ...textStyles.label,
    color: colors.textMuted,
  },
  snippet: {
    ...textStyles.body,
    color: colors.textPending,
  },
  match: {
    fontFamily: fonts.medium,
    color: colors.text,
  },
});
