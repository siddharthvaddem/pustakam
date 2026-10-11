import { StyleSheet } from 'react-native';
import { colors, textStyles } from '../../theme';

// JetBrains Mono glyphs are 0.6em wide, so this is exactly one space.
const wordGap = Math.round(textStyles.transcript.fontSize * 0.6);

export const styles = StyleSheet.create({
  word: {
    ...textStyles.transcript,
    marginRight: wordGap,
  },
  final: {
    color: colors.text,
  },
  pending: {
    color: colors.textPending,
  },
});
