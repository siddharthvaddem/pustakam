import { makeStyles } from '../../theme';

export const useStyles = makeStyles((c) => ({
  dock: {
    position: 'absolute',
    right: 20,
    bottom: 0,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
  },
}));
