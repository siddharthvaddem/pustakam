import { fonts, makeStyles, textStyles } from '../../theme';

export const useStyles = makeStyles((c) => ({
  card: {
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: c.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  when: {
    ...textStyles.label,
    color: c.textMuted,
  },
  snippet: {
    ...textStyles.body,
    color: c.textPending,
  },
  match: {
    fontFamily: fonts.medium,
    color: c.text,
  },
}));
