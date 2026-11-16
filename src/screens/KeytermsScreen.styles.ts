import { makeStyles, textStyles } from '../theme';

export const useStyles = makeStyles((c) => ({
  screen: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  intro: {
    ...textStyles.body,
    color: c.textMuted,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  sectionLabel: {
    ...textStyles.label,
    color: c.textMuted,
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
    color: c.text,
    flex: 1,
    paddingVertical: 16,
  },
  term: {
    ...textStyles.body,
    color: c.text,
    flex: 1,
    paddingVertical: 16,
  },
  error: {
    ...textStyles.label,
    color: c.danger,
    paddingHorizontal: 4,
  },
  empty: {
    ...textStyles.body,
    color: c.textMuted,
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
    color: c.text,
  },
  resetText: {
    ...textStyles.label,
    color: c.textMuted,
    textTransform: 'uppercase',
  },
  sliderScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetHint: {
    ...textStyles.label,
    color: c.textMuted,
  },
}));
