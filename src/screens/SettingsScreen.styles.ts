import { StyleSheet } from 'react-native';
import { colors, textStyles } from '../theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  group: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  rowPressed: {
    backgroundColor: colors.divider,
  },
  // Thin line between rows, inset to line up with the labels.
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginHorizontal: 20,
  },
  label: {
    ...textStyles.body,
    color: colors.text,
    flex: 1,
  },
  detail: {
    ...textStyles.body,
    color: colors.textMuted,
  },
});
