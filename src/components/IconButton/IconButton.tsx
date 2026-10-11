import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';
import { colors } from '../../theme';
import { styles } from './IconButton.styles';

type IconButtonProps = {
  icon: ComponentProps<typeof Feather>['name'];
  accessibilityLabel: string;
  onPress: () => void;
};

// The round dark button used for menu, back and settings.
export function IconButton({ icon, accessibilityLabel, onPress }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Feather name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}
