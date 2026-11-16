import { makeStyles, textStyles } from '../../theme';

export const useStyles = makeStyles((c) => ({
  caret: {
    width: 2,
    height: textStyles.transcript.fontSize * 1.1,
    borderRadius: 1,
    backgroundColor: c.accent,
  },
}));
