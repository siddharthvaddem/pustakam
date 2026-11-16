import { asc } from 'drizzle-orm';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { strToU8, zipSync } from 'fflate';
import { db } from '../../db/client';
import { type Entry, entries } from '../../db/schema';
import { localDay, timeLabel } from './dates';

function dayHeading(day: string): string {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function dayToMarkdown(day: string, dayEntries: Entry[]): string {
  const sections = dayEntries.map((entry) => `## ${timeLabel(entry.startedAt)}\n\n${entry.text}`);
  return `# ${dayHeading(day)}\n\n${sections.join('\n\n')}\n`;
}

/** Zips every day into `pustakam-notes/YYYY-MM-DD.md` and opens the share sheet. */
export async function exportNotes(): Promise<number> {
  const rows = await db.select().from(entries).orderBy(asc(entries.day), asc(entries.startedAt));
  if (rows.length === 0) return 0;

  const byDay = new Map<string, Entry[]>();
  for (const row of rows) byDay.set(row.day, [...(byDay.get(row.day) ?? []), row]);

  const files: Record<string, Uint8Array> = {};
  for (const [day, dayEntries] of byDay) {
    files[`${day}.md`] = strToU8(dayToMarkdown(day, dayEntries));
  }

  const zip = new File(Paths.cache, `pustakam-notes-${localDay(new Date())}.zip`);
  if (zip.exists) zip.delete();
  zip.create();
  zip.write(zipSync({ 'pustakam-notes': files }));

  await Sharing.shareAsync(zip.uri, {
    mimeType: 'application/zip',
    UTI: 'public.zip-archive',
    dialogTitle: 'Export notes',
  });
  return byDay.size;
}
