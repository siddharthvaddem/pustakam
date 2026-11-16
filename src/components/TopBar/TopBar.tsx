import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';
import { IconButton } from '../IconButton/IconButton';
import { useStyles } from './TopBar.styles';

type TopBarProps = {
  title?: string;
  // Right-side button, e.g. discard.
  action?: ComponentProps<typeof IconButton>;
} & ComponentProps<typeof IconButton>;

export function TopBar({ title, action, ...button }: TopBarProps) {
  const styles = useStyles();
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
