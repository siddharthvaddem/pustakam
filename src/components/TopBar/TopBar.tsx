import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';
import { IconButton } from '../IconButton/IconButton';
import { styles } from './TopBar.styles';

type TopBarProps = {
  title?: string;
} & ComponentProps<typeof IconButton>;

// A row with a round button on the left (menu or back) and an optional centered title.
export function TopBar({ title, ...button }: TopBarProps) {
  return (
    <View style={styles.bar}>
      {title ? (
        <Text style={styles.title} accessibilityRole="header" pointerEvents="none">
          {title}
        </Text>
      ) : null}
      <IconButton {...button} />
    </View>
  );
}
