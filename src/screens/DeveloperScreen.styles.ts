import { StyleSheet } from 'react-native';
import { colors, textStyles } from '../theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  sectionLabel: {
    ...textStyles.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  info: {
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  body: {
    ...textStyles.body,
    color: colors.textMuted,
  },
  detail: {
    ...textStyles.label,
    color: colors.text,
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  rowPressed: {
    backgroundColor: colors.divider,
  },
  rowLabel: {
    ...textStyles.body,
    color: colors.text,
  },
  status: {
    ...textStyles.label,
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
});
