import { sqlite, vecReady } from '../../db/client';
import { embedQuery } from './embedder';
import {
  blendSimilarity,
  CANDIDATES,
  fuse,
  keepMeaning,
  keywordQuery,
  type MeaningMatch,
  type VocabTerm,
} from './ranking';

// Full-text and embedding search, merged.

// Marks matched words in a snippet, so they can be shown in bold.
export const MATCH_START = '\u0001';
export const MATCH_END = '\u0002';

export type SearchResult = {
  id: number;
  day: string;
  startedAt: Date;
  snippet: string;
};

type EntryRow = { id: number; day: string; startedAt: number; text: string };

function preview(text: string): string {
  return text.length > 120 ? `${text.slice(0, 120).trimEnd()}…` : text;
}

async function keywordMatches(query: string) {
  const vocab = await sqlite.getAllAsync<VocabTerm>('SELECT term, doc FROM entries_vocab');
  const match = keywordQuery(query, vocab);
  if (!match) return [];
  return sqlite.getAllAsync<{ id: number; snippet: string }>(
    `SELECT rowid AS id, snippet(entries_fts, 0, char(1), char(2), '…', 12) AS snippet
     FROM entries_fts WHERE entries_fts MATCH ? ORDER BY rank LIMIT ?`,
    [match, CANDIDATES],
  );
}

async function meaningMatches(query: string): Promise<MeaningMatch[]> {
  if (!vecReady) return [];
  const vector = await embedQuery(query);
  // Per entry: the whole entry's similarity and its best sentence's.
  const rows = await sqlite.getAllAsync<{ id: number; whole: number; sentence: number | null }>(
    `WITH q(v) AS (SELECT vec_f32(?))
     SELECT entry_id AS id,
       MAX(CASE WHEN chunk = 0 THEN 1 - vec_distance_cosine(embedding, q.v) END) AS whole,
       MAX(CASE WHEN chunk > 0 THEN 1 - vec_distance_cosine(embedding, q.v) END) AS sentence
     FROM entry_embeddings, q
     GROUP BY entry_id
     HAVING whole IS NOT NULL`,
    [JSON.stringify(vector)],
  );
  return rows
    .map((row) => ({ id: row.id, similarity: blendSimilarity(row.whole, row.sentence ?? -1) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, CANDIDATES);
}

async function loadEntries(ids: number[]): Promise<Map<number, EntryRow>> {
  if (ids.length === 0) return new Map();
  const rows = await sqlite.getAllAsync<EntryRow>(
    `SELECT id, day, started_at AS startedAt, text FROM entries
     WHERE id IN (${ids.map(() => '?').join(',')})`,
    ids,
  );
  return new Map(rows.map((row) => [row.id, row]));
}

export async function searchNotes(query: string): Promise<SearchResult[]> {
  const [byWords, byMeaning] = await Promise.all([
    keywordMatches(query),
    meaningMatches(query).then(keepMeaning),
  ]);
  const ranked = fuse(
    byWords.map((row) => row.id),
    byMeaning.map((row) => row.id),
  );
  const entries = await loadEntries(ranked);
  const snippets = new Map(byWords.map((row) => [row.id, row.snippet]));

  return ranked.flatMap((id) => {
    const entry = entries.get(id);
    if (!entry) return [];
    const snippet = snippets.get(id) ?? preview(entry.text);
    return [{ id, day: entry.day, startedAt: new Date(entry.startedAt), snippet }];
  });
}

// Related-moments cut-off; not tuned yet.
const RELATED_MIN_SIMILARITY = 0.69;

// Up to 3 notes from other days closest in meaning to any note on `day`.
export async function relatedMoments(day: string): Promise<SearchResult[]> {
  if (!vecReady) return [];
  const rows = await sqlite.getAllAsync<EntryRow>(
    `SELECT e.id, e.day, e.started_at AS startedAt, e.text FROM (
       SELECT other.entry_id AS id, MIN(vec_distance_cosine(mine.embedding, other.embedding)) AS distance
       FROM entries me
       JOIN entry_embeddings mine ON mine.entry_id = me.id AND mine.chunk = 0
       JOIN entries oe ON oe.day <> me.day
       JOIN entry_embeddings other ON other.entry_id = oe.id AND other.chunk = 0
       WHERE me.day = ?
       GROUP BY other.entry_id
       HAVING distance <= ?
       ORDER BY distance LIMIT 3
     ) closest JOIN entries e ON e.id = closest.id ORDER BY closest.distance`,
    [day, 1 - RELATED_MIN_SIMILARITY],
  );
  return rows.map((row) => ({
    id: row.id,
    day: row.day,
    startedAt: new Date(row.startedAt),
    snippet: preview(row.text),
  }));
}
