import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';
import { IconButton } from '../IconButton/IconButton';
import { styles } from './TopBar.styles';

type TopBarProps = {
  title?: string;
  // An optional second button on the right, e.g. discard.
  action?: ComponentProps<typeof IconButton>;
} & ComponentProps<typeof IconButton>;

// A row with a round button on the left (menu or back), an optional centered title
// and an optional button on the right.
export function TopBar({ title, action, ...button }: TopBarProps) {
  return (
    <View style={styles.bar}>
      {title ? (
        <Text style={styles.title} accessibilityRole="header" pointerEvents="none">
          {title}
        </Text>
      ) : null}
      <IconButton {...button} />
      {action ? <IconButton {...action} /> : null}
    </View>
  );
}
