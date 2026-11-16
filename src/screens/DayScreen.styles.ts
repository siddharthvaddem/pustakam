import { makeStyles, textStyles } from '../theme';

export const useStyles = makeStyles((c) => ({
  screen: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    gap: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  entry: {
    gap: 6,
  },
  glow: {
    position: 'absolute',
    top: -12,
    bottom: -12,
    left: -16,
    right: -16,
    borderRadius: 20,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.divider,
  },
  related: {
    gap: 8,
    paddingTop: 12,
  },
  relatedLabel: {
    ...textStyles.label,
    color: c.textMuted,
    textTransform: 'uppercase',
    paddingBottom: 4,
  },
  time: {
    ...textStyles.label,
    color: c.textMuted,
    textTransform: 'uppercase',
  },
  text: {
    ...textStyles.body,
    color: c.text,
  },
  editor: {
    ...textStyles.body,
    color: c.text,
    // TextInput adds its own padding on Android; the plain text has none.
    padding: 0,
    textAlignVertical: 'top',
  },
}));
