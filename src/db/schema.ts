import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Words the speech model should lean towards, spelled exactly as they should appear.
export const keyterms = sqliteTable('keyterms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  term: text('term').notNull(),
});

// App preferences as key/value pairs, e.g. keytermBoost = "8".
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export type Keyterm = typeof keyterms.$inferSelect;
