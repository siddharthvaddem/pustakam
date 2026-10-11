import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { listKeytermsQuery } from './repository';

// The keyword list, kept up to date automatically when rows change.
export function useKeyterms() {
  const { data } = useLiveQuery(listKeytermsQuery());
  return data;
}
