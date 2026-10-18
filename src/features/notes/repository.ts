import { asc, desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { db } from '../../db/client';
import { entries } from '../../db/schema';
import { syncIndex } from '../search/indexer';
import { localDay } from './dates';

// All reads and writes of the entries table go through here.

// Saves a new entry under the day it was started. Empty text is skipped.
export async function addEntry({ text, startedAt }: { text: string; startedAt: Date }) {
  const trimmed = text.trim();
  if (!trimmed) return;
  await db.insert(entries).values({ day: localDay(startedAt), startedAt, text: trimmed });
  syncIndex();
}

export async function updateEntry(id: number, text: string) {
  await db.update(entries).set({ text: text.trim() }).where(eq(entries.id, id));
  syncIndex();
}

export async function deleteEntry(id: number) {
  await db.delete(entries).where(eq(entries.id, id));
}

// One row per day, newest first, with how many entries it has and the first one as a preview.
const earliest = alias(entries, 'earliest');
export function daysQuery() {
  const firstText = db
    .select({ text: earliest.text })
    .from(earliest)
    .where(eq(earliest.day, entries.day))
    .orderBy(asc(earliest.startedAt))
    .limit(1);

  return db
    .select({
      day: entries.day,
      count: sql<number>`count(*)`,
      preview: sql<string>`(${firstText})`,
    })
    .from(entries)
    .groupBy(entries.day)
    .orderBy(desc(entries.day));
}

export function dayEntriesQuery(day: string) {
  return db.select().from(entries).where(eq(entries.day, day)).orderBy(asc(entries.startedAt));
}
