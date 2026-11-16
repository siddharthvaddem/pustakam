import { makeStyles } from '../../theme';

export const BUTTON_SIZE = 44;

export const useStyles = makeStyles((c) => ({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
  },
  pressed: {
    opacity: 0.7,
  },
}));
