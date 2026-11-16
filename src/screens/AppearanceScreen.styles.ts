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
  preview: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionLabel: {
    ...textStyles.label,
    color: c.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  segments: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 24,
    backgroundColor: c.surface,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 20,
  },
  segmentSelected: {
    backgroundColor: c.divider,
  },
  segmentText: {
    ...textStyles.body,
    color: c.textMuted,
  },
  segmentTextSelected: {
    color: c.text,
  },
  swatches: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  swatch: {
    alignItems: 'center',
    gap: 8,
  },
  swatchDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchLabel: {
    ...textStyles.label,
    color: c.textMuted,
  },
  swatchLabelSelected: {
    color: c.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  rowLabel: {
    ...textStyles.body,
    color: c.text,
  },
}));
