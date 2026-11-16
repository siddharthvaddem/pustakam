import { makeStyles, textStyles } from '../../theme';

export const useStyles = makeStyles((c) => ({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  content: {
    // Text grows upward from just above the orb.
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    // A caret-only row stays a full line tall so nothing jumps.
    minHeight: textStyles.transcript.lineHeight,
  },
  draft: {
    ...textStyles.transcript,
    color: c.text,
  },
  placeholder: {
    ...textStyles.transcript,
    color: c.textMuted,
    textAlign: 'center',
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  jumpButton: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: c.surface,
  },
  jumpButtonText: {
    ...textStyles.label,
    color: c.text,
  },
}));
