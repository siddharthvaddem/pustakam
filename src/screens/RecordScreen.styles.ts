import { makeStyles, textStyles } from '../theme';

export const useStyles = makeStyles((c) => ({
  screen: {
    flex: 1,
    backgroundColor: c.background,
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
    color: c.textMuted,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  error: {
    color: c.danger,
    textTransform: 'none',
  },
  // Keeps the last line of text clear of the check button while typing.
  keyboardSpacer: {
    height: 64,
  },
}));
