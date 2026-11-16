import { makeStyles, textStyles } from '../../theme';

// JetBrains Mono glyphs are 0.6em wide, so this is exactly one space.
const wordGap = Math.round(textStyles.transcript.fontSize * 0.6);

export const useStyles = makeStyles((c) => ({
  word: {
    ...textStyles.transcript,
    marginRight: wordGap,
  },
  final: {
    color: c.text,
  },
  pending: {
    color: c.textPending,
  },
}));
