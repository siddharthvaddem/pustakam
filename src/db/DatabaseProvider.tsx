import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import migrations from '../../drizzle/migrations';
import { textStyles, useTheme } from '../theme';
import { db } from './client';

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { success, error } = useMigrations(db, migrations);
  const { colors } = useTheme();

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
