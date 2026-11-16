import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { listKeytermsQuery } from './repository';

export function useKeyterms() {
  const { data } = useLiveQuery(listKeytermsQuery());
  return data;
}
