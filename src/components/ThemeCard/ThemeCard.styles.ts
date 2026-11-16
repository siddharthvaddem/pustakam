import { StyleSheet } from 'react-native';
import { makeStyles, textStyles } from '../../theme';

export const useStyles = makeStyles((c) => ({
  card: {
    flexShrink: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: c.surface,
  },
  header: {
    ...textStyles.title,
    color: c.text,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  count: {
    ...textStyles.label,
    color: c.textMuted,
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: c.divider,
    marginHorizontal: 20,
  },
}));
