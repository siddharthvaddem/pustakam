import { BUTTON_SIZE } from '../components/IconButton/IconButton.styles';
import { makeStyles, textStyles } from '../theme';

export const useStyles = makeStyles((c) => ({
  screen: {
    flex: 1,
    backgroundColor: c.background,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: BUTTON_SIZE,
    paddingHorizontal: 16,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: c.surface,
  },
  input: {
    ...textStyles.body,
    flex: 1,
    color: c.text,
    // TextInput adds its own padding on Android.
    padding: 0,
  },
  hint: {
    ...textStyles.label,
    color: c.textMuted,
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  list: {
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
}));
