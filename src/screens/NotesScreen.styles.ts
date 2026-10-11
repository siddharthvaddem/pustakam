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
  list: {
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  dayText: {
    flex: 1,
    gap: 4,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  dayLabel: {
    ...textStyles.title,
    color: colors.text,
  },
  count: {
    ...textStyles.label,
    color: colors.textMuted,
  },
  preview: {
    ...textStyles.body,
    color: colors.textMuted,
  },
});
