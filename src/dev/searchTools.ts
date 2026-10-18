import { openDatabaseAsync } from 'expo-sqlite';
import { embedNotes, embedQuery } from '../features/search/embedder';
import { sentences } from '../features/search/ranking';
import { searchNotes } from '../features/search/search';
import { EVAL_QUERIES, type Run, summarize, SUMMARY_HEADER } from './searchEval';
import { SEED_ID_BASE, SEED_NOTES } from './seedNotes';

// Runs the test searches through the real search; should match scripts/search-eval.mjs.
export async function runSearchChecks(): Promise<string> {
  const runs: Run[] = [];
  for (const q of EVAL_QUERIES) {
    const results = await searchNotes(q.query);
    const keys = results.map((r) => SEED_NOTES[r.id - SEED_ID_BASE]?.key ?? `own-${r.id}`);
    runs.push({ q, keys });
  }
  const split = (name: string) => runs.filter((run) => run.q.split === name);
  return [
    `      ${SUMMARY_HEADER}`,
    `dev   ${summarize(split('dev'))}`,
    `test  ${summarize(split('test'))}`,
  ].join('\n');
}

async function embedInBatches(texts: string[], embed: (batch: string[]) => Promise<number[][]>) {
  const vectors: number[][] = [];
  for (let i = 0; i < texts.length; i += 8) vectors.push(...(await embed(texts.slice(i, i + 8))));
  return vectors;
}

// Saves sample-note and test-search embeddings to search-eval.db for scripts/search-eval.mjs.
export async function exportEvalVectors(): Promise<string> {
  const rows: [string, string, number[]][] = [];

  const notes = await embedInBatches(
    SEED_NOTES.map((note) => note.text),
    embedNotes,
  );
  SEED_NOTES.forEach((note, i) => rows.push(['note', note.key, notes[i]]));

  const parts = SEED_NOTES.flatMap((note) => {
    const found = sentences(note.text);
    return found.length > 1 ? found.map((text, i) => [`${note.key}#s${i}`, text] as const) : [];
  });
  const chunks = await embedInBatches(
    parts.map(([, text]) => text),
    embedNotes,
  );
  parts.forEach(([ref], i) => rows.push(['chunk', ref, chunks[i]]));

  for (const q of EVAL_QUERIES) rows.push(['query', q.id, await embedQuery(q.query)]);

  const db = await openDatabaseAsync('search-eval.db');
  await db.execAsync(`DROP TABLE IF EXISTS vectors;
    CREATE TABLE vectors (kind TEXT, ref TEXT, vector TEXT)`);
  await db.withTransactionAsync(async () => {
    for (const [kind, ref, vector] of rows) {
      await db.runAsync('INSERT INTO vectors VALUES (?, ?, ?)', [
        kind,
        ref,
        JSON.stringify(vector),
      ]);
    }
  });
  await db.closeAsync();
  return `Exported ${rows.length} vectors to search-eval.db`;
}
