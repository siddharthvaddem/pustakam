import { drizzle } from 'drizzle-orm/expo-sqlite';
import { bundledExtensions, openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// One database file in the app's private storage. The change listener is what
// lets useLiveQuery re-render screens when rows change.
export const sqlite = openDatabaseSync('pustakam.db', { enableChangeListener: true });

// Vector functions for search. Without them, search is keyword-only.
function loadVec(): boolean {
  const vec = bundledExtensions['sqlite-vec'];
  if (!vec) return false;
  try {
    sqlite.loadExtensionSync(vec.libPath, vec.entryPoint);
    return true;
  } catch (error) {
    console.warn('sqlite-vec failed to load', error);
    return false;
  }
}
export const vecReady = loadVec();

export const db = drizzle(sqlite, { schema });
