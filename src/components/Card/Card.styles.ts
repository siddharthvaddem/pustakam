import { StyleSheet } from 'react-native';
import { makeStyles } from '../../theme';

export const useStyles = makeStyles((c) => ({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: c.surface,
  },
  // Inset to line up with the content.
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: c.divider,
    marginHorizontal: 20,
  },
}));
