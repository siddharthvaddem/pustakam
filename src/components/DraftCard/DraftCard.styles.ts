import { StyleSheet } from 'react-native';
import { colors, textStyles } from '../../theme';

const BUTTON_SIZE = 36;

export const styles = StyleSheet.create({
  // Fills the space above the orb and keeps the card at the bottom of it.
  area: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  card: {
    maxHeight: '100%',
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  // Lets the card hug short drafts and scroll long ones.
  scroll: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  editor: {
    ...textStyles.transcript,
    color: colors.text,
    // TextInput adds its own padding on Android.
    padding: 0,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  discard: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  send: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text,
  },
  sendDisabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.6,
  },
});
