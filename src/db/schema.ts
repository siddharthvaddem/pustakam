import { blob, index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// A day's note is just its entries in time order; days aren't stored separately.
export const entries = sqliteTable(
  'entries',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    // Local 'YYYY-MM-DD', stored so a note never hops days when the timezone changes.
    day: text('day').notNull(),
    startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull(),
    text: text('text').notNull(),
  },
  (table) => [index('entries_day_idx').on(table.day)],
);

// chunk 0 = whole entry, 1.. = sentences. 0002_search.sql triggers clear stale rows.
export const entryEmbeddings = sqliteTable(
  'entry_embeddings',
  {
    entryId: integer('entry_id').notNull(),
    chunk: integer('chunk').notNull(),
    embedding: blob('embedding').notNull(),
  },
  (table) => [primaryKey({ columns: [table.entryId, table.chunk] })],
);

// Spelled exactly as they should appear in transcripts.
export const keyterms = sqliteTable('keyterms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  term: text('term').notNull(),
});

// e.g. keytermBoost = "4".
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export type Entry = typeof entries.$inferSelect;
export type Keyterm = typeof keyterms.$inferSelect;
