import { Children, Fragment, type ReactNode } from 'react';
import { View } from 'react-native';
import { styles } from './Card.styles';

// A rounded group of rows with thin dividers between them, as on the settings screens.
export function Card({ children }: { children: ReactNode }) {
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
