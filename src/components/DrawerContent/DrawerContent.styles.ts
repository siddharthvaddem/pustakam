import { makeStyles, textStyles } from '../../theme';

export const useStyles = makeStyles((c) => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
    paddingHorizontal: 12,
  },
  appName: {
    ...textStyles.appName,
    color: c.text,
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 32,
  },
  sectionLabel: {
    ...textStyles.label,
    color: c.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  itemActive: {
    backgroundColor: c.surface,
  },
  itemLabel: {
    ...textStyles.body,
    color: c.text,
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
}));
