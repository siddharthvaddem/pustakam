import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { type ReactNode, useEffect } from 'react';
import { Text, View } from 'react-native';
import migrations from '../../drizzle/migrations';
import { colors, textStyles } from '../theme';
import { syncIndex } from '../features/search/indexer';
import { db } from './client';

// Brings the database up to date on launch, then shows the app.
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success) syncIndex();
  }, [success]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ ...textStyles.body, color: colors.danger }}>
          Couldn&apos;t open the database: {error.message}
        </Text>
      </View>
    );
  }
  if (!success) return null;
  return children;
}
