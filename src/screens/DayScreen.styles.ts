import { StyleSheet } from 'react-native';
import { colors, textStyles } from '../theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  entry: {
    gap: 6,
  },
  glow: {
    position: 'absolute',
    top: -12,
    bottom: -12,
    left: -16,
    right: -16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  related: {
    gap: 8,
    paddingTop: 12,
  },
  relatedLabel: {
    ...textStyles.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    paddingBottom: 4,
  },
  time: {
    ...textStyles.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  text: {
    ...textStyles.body,
    color: colors.text,
  },
  editor: {
    ...textStyles.body,
    color: colors.text,
    // TextInput adds its own padding on Android; the plain text has none.
    padding: 0,
    textAlignVertical: 'top',
  },
});
