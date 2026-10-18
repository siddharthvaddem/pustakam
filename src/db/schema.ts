import { blob, index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// One saved recording. A day's note is just its entries in time order; the day
// itself isn't stored anywhere else.
export const entries = sqliteTable(
  'entries',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    // Local date the recording started, as 'YYYY-MM-DD'. Stored rather than worked out
    // from startedAt so a note never hops days when the phone's timezone changes.
    day: text('day').notNull(),
    // When you started speaking. Orders a day's entries and shows "9:41 am".
    startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull(),
    text: text('text').notNull(),
  },
  (table) => [index('entries_day_idx').on(table.day)],
);

// Search embeddings: chunk 0 is the whole entry, 1.. its sentences. Triggers in
// drizzle/0002_search.sql clear an entry's rows when it changes, so it gets re-indexed.
export const entryEmbeddings = sqliteTable(
  'entry_embeddings',
  {
    entryId: integer('entry_id').notNull(),
    chunk: integer('chunk').notNull(),
    embedding: blob('embedding').notNull(),
  },
  (table) => [primaryKey({ columns: [table.entryId, table.chunk] })],
);

// Words the speech model should lean towards, spelled exactly as they should appear.
export const keyterms = sqliteTable('keyterms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  term: text('term').notNull(),
});

// App preferences as key/value pairs, e.g. keytermBoost = "4".
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export type Entry = typeof entries.$inferSelect;
export type Keyterm = typeof keyterms.$inferSelect;
