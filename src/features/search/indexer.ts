import { sqlite, vecReady } from '../../db/client';
import { embedNotes } from './embedder';
import { sentences } from './ranking';

// chunk 0 = whole entry, 1.. = sentences.

const BATCH = 4;

let running = false;
let dirty = false;
// Skipped until the app restarts, so one bad entry can't block the rest.
const failed = new Set<number>();

type Row = { id: number; text: string };

async function indexEntry(row: Row) {
  const parts = sentences(row.text);
  const texts = [row.text, ...(parts.length > 1 ? parts : [])];
  const vectors = await embedNotes(texts);
  // Chunk 0 last marks the entry done; the text check drops rows if it was edited meanwhile.
  for (let chunk = texts.length - 1; chunk >= 0; chunk--) {
    await sqlite.runAsync(
      `INSERT OR REPLACE INTO entry_embeddings (entry_id, chunk, embedding)
       SELECT id, ?, vec_f32(?) FROM entries WHERE id = ? AND text = ?`,
      [chunk, JSON.stringify(vectors[chunk]), row.id, row.text],
    );
  }
}

async function indexMissing() {
  while (true) {
    const rows = await sqlite.getAllAsync<Row>(
      `SELECT id, text FROM entries
       WHERE id NOT IN (SELECT entry_id FROM entry_embeddings WHERE chunk = 0)
       ORDER BY id DESC`,
    );
    const batch = rows.filter((row) => !failed.has(row.id)).slice(0, BATCH);
    if (batch.length === 0) return;
    for (const row of batch) {
      try {
        await indexEntry(row);
      } catch (error) {
        console.warn(`Couldn't index entry ${row.id}`, error);
        failed.add(row.id);
      }
    }
  }
}

// Safe to call any time; only one pass runs at once.
export async function syncIndex() {
  if (!vecReady) return;
  dirty = true;
  if (running) return;
  running = true;
  try {
    while (dirty) {
      dirty = false;
      await indexMissing();
    }
  } catch (error) {
    console.warn('Search indexing stopped', error);
  } finally {
    running = false;
  }
}
