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
  intro: {
    ...textStyles.body,
    color: colors.textMuted,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  sectionLabel: {
    ...textStyles.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    minHeight: 56,
  },
  input: {
    ...textStyles.body,
    color: colors.text,
    flex: 1,
    paddingVertical: 16,
  },
  term: {
    ...textStyles.body,
    color: colors.text,
    flex: 1,
    paddingVertical: 16,
  },
  error: {
    ...textStyles.label,
    color: colors.danger,
    paddingHorizontal: 4,
  },
  empty: {
    ...textStyles.body,
    color: colors.textMuted,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sliderBlock: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 4,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sliderValue: {
    ...textStyles.title,
    color: colors.text,
  },
  resetText: {
    ...textStyles.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  sliderScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetHint: {
    ...textStyles.label,
    color: colors.textMuted,
  },
});
