import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// One database file in the app's private storage. The change listener is what
// lets useLiveQuery re-render screens when rows change.
const sqlite = openDatabaseSync('pustakam.db', { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });
