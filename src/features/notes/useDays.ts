import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { daysQuery } from './repository';

// Every day that has notes, newest first, kept up to date as entries change.
export function useDays() {
  const { data } = useLiveQuery(daysQuery());
  return data;
}
