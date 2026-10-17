import { gte } from 'drizzle-orm';
import { db } from '../db/client';
import { entries } from '../db/schema';
import { localDay } from '../features/notes/dates';
import { SEED_ID_BASE, SEED_NOTES } from './seedNotes';

function startedAt(daysAgo: number, time: string, now: Date): Date {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hours, minutes);
}

/** Replaces any loaded sample notes. Returns how many were added. */
export async function loadSampleNotes(): Promise<number> {
  const now = new Date();
  const rows = SEED_NOTES.map((note, index) => {
    const date = startedAt(note.daysAgo, note.time, now);
    return { id: SEED_ID_BASE + index, day: localDay(date), startedAt: date, text: note.text };
  });
  await removeSampleNotes();
  await db.insert(entries).values(rows);
  return rows.length;
}

/** Real notes have ids far below SEED_ID_BASE, so they're never touched. */
export async function removeSampleNotes(): Promise<void> {
  await db.delete(entries).where(gte(entries.id, SEED_ID_BASE));
}

export async function countSampleNotes(): Promise<number> {
  return db.$count(entries, gte(entries.id, SEED_ID_BASE));
}
