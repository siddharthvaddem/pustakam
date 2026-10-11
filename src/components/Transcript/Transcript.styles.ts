import { StyleSheet } from 'react-native';
import { colors, textStyles } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  content: {
    // Text sits at the bottom, right above the orb, and grows upward.
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    // Keeps the row a full line tall when it only holds the caret, so nothing jumps.
    minHeight: textStyles.transcript.lineHeight,
  },
  editor: {
    ...textStyles.transcript,
    color: colors.text,
    // TextInput adds its own padding on Android; the live view has none.
    padding: 0,
    textAlignVertical: 'top',
  },
  placeholder: {
    ...textStyles.transcript,
    color: colors.textMuted,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  jumpButton: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  jumpButtonText: {
    ...textStyles.label,
    color: colors.text,
  },
});
