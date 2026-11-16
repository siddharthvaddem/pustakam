import { StyleSheet } from 'react-native';
import { fonts, makeStyles } from '../../theme';

export const SEGMENT_WIDTH = 104;
export const PILL_HEIGHT = 54;
const INSET = 5;

export const useStyles = makeStyles((c) => ({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shadow: {
    borderRadius: PILL_HEIGHT / 2,
    shadowColor: '#000',
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  pill: {
    flexDirection: 'row',
    height: PILL_HEIGHT,
    padding: INSET,
    borderRadius: PILL_HEIGHT / 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${c.text}24`,
  },
  // Keeps the pill readable where blur is weak or off (Android).
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${c.surface}8C`,
  },
  glow: {
    position: 'absolute',
    top: INSET,
    left: INSET,
    width: SEGMENT_WIDTH,
    height: PILL_HEIGHT - INSET * 2,
    borderRadius: (PILL_HEIGHT - INSET * 2) / 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${c.accent}55`,
  },
  segment: {
    width: SEGMENT_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 15,
    letterSpacing: 0.4,
    color: c.textMuted,
  },
}));
