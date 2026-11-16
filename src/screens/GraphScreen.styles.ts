import { makeStyles, textStyles } from '../theme';

export const useStyles = makeStyles((c) => ({
  screen: {
    flex: 1,
    backgroundColor: c.background,
  },
  center: {
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
  graph: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxHeight: '40%',
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  hint: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: c.surface,
  },
  hintText: {
    ...textStyles.label,
    color: c.textMuted,
  },
}));
