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
