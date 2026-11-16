import { Children, Fragment, type ReactNode } from 'react';
import { View } from 'react-native';
import { useStyles } from './Card.styles';

export function Card({ children }: { children: ReactNode }) {
  const styles = useStyles();
  const rows = Children.toArray(children);
  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 && <View style={styles.divider} />}
          {row}
        </Fragment>
      ))}
    </View>
  );
}
