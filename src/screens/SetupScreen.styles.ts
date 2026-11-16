import { makeStyles, textStyles } from '../theme';

const BUTTON_HEIGHT = 52;

export const useStyles = makeStyles((c) => ({
  screen: {
    flex: 1,
    backgroundColor: c.background,
  },
  intro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  appName: {
    ...textStyles.appName,
    color: c.text,
  },
  orb: {
    marginVertical: 8,
  },
  title: {
    ...textStyles.title,
    color: c.text,
    textAlign: 'center',
  },
  body: {
    ...textStyles.body,
    color: c.textMuted,
    textAlign: 'center',
    maxWidth: 340,
  },
  // Same height whatever's inside, so the intro doesn't jump between states.
  footer: {
    minHeight: 164,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  meta: {
    ...textStyles.label,
    color: c.textMuted,
    textAlign: 'center',
  },
  error: {
    ...textStyles.body,
    color: c.danger,
    textAlign: 'center',
    maxWidth: 340,
  },
  button: {
    alignSelf: 'stretch',
    maxWidth: 420,
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.text,
  },
  buttonText: {
    ...textStyles.title,
    color: c.background,
  },
  pressed: {
    opacity: 0.7,
  },
  track: {
    alignSelf: 'stretch',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: c.divider,
  },
  fillBar: {
    height: '100%',
    backgroundColor: c.text,
  },
  link: {
    ...textStyles.label,
    color: c.textMuted,
    textTransform: 'uppercase',
    paddingVertical: 4,
  },
}));
