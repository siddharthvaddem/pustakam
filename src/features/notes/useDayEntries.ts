import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { dayEntriesQuery } from './repository';

// One day's entries in the order they were recorded.
export function useDayEntries(day: string) {
  const { data } = useLiveQuery(dayEntriesQuery(day), [day]);
  return data;
}
