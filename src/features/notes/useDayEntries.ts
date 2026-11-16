import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { dayEntriesQuery } from './repository';

export function useDayEntries(day: string) {
  const { data } = useLiveQuery(dayEntriesQuery(day), [day]);
  return data;
}
