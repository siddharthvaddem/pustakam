import { StyleSheet } from 'react-native';
import { colors, textStyles } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
  },
  appName: {
    ...textStyles.appName,
    color: colors.text,
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 32,
  },
  sectionLabel: {
    ...textStyles.label,
    color: colors.textMuted,
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
    backgroundColor: colors.surface,
  },
  itemLabel: {
    ...textStyles.body,
    color: colors.text,
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
});
