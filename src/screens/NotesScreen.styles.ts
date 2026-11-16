import { makeStyles, textStyles } from '../theme';

export const useStyles = makeStyles((c) => ({
  screen: {
    flex: 1,
    backgroundColor: c.background,
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
    color: c.textPending,
    textAlign: 'center',
  },
  emptyHint: {
    ...textStyles.label,
    color: c.textMuted,
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
    backgroundColor: c.surface,
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
    color: c.text,
  },
  count: {
    ...textStyles.label,
    color: c.textMuted,
  },
  preview: {
    ...textStyles.body,
    color: c.textMuted,
  },
}));
