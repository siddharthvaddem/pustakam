import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { daysQuery } from './repository';

export function useDays() {
  const { data } = useLiveQuery(daysQuery());
  return data;
}
