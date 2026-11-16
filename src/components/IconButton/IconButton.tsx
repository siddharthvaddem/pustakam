import type { Icon } from 'phosphor-react-native';
import { Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { useStyles } from './IconButton.styles';

type IconButtonProps = {
  icon: Icon;
  accessibilityLabel: string;
  onPress: () => void;
};

export function IconButton({ icon: IconGlyph, accessibilityLabel, onPress }: IconButtonProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <IconGlyph weight="regular" size={20} color={colors.text} />
    </Pressable>
  );
}
