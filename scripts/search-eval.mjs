// Scores search against the test set in src/dev/searchEval.ts, using the app's ranking.ts.
// 1. App: Settings → Developer → Load sample notes, then Export search test data.
// 2. node --experimental-strip-types scripts/search-eval.mjs <path to search-eval.db> [--detail=shipped]
//    (find it with: find ~/Library/Developer/CoreSimulator -name search-eval.db)
import { DatabaseSync } from 'node:sqlite';
import * as ranking from '../src/features/search/ranking.ts';
import { SEED_ID_BASE, SEED_NOTES } from '../src/dev/seedNotes.ts';
import {
  average,
  EVAL_QUERIES,
  scoreOne,
  summarize,
  SUMMARY_HEADER,
} from '../src/dev/searchEval.ts';

const dbPath = process.argv[2];
if (!dbPath) {
  console.error('usage: node --experimental-strip-types scripts/search-eval.mjs <search-eval.db>');
  process.exit(1);
}

const vectors = { note: {}, chunk: {}, query: {} };
for (const row of new DatabaseSync(dbPath).prepare('SELECT * FROM vectors').all()) {
  vectors[row.kind][row.ref] = JSON.parse(row.vector);
}

const idOf = new Map(SEED_NOTES.map((note, i) => [note.key, SEED_ID_BASE + i]));
const keyOf = new Map([...idOf].map(([key, id]) => [id, key]));

// Chunk refs look like "race-day#s0".
const sentencesOf = {};
for (const [ref, vector] of Object.entries(vectors.chunk)) {
  const [key] = ref.split('#');
  (sentencesOf[key] ??= []).push(vector);
}

// Same keyword index and vocabulary as drizzle/0002_search.sql.
function keywordIndex() {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE VIRTUAL TABLE fts USING fts5(text)');
  db.exec("CREATE VIRTUAL TABLE vocab USING fts5vocab(fts, 'row')");
  const insert = db.prepare('INSERT INTO fts (rowid, text) VALUES (?, ?)');
  SEED_NOTES.forEach((note) => insert.run(idOf.get(note.key), note.text));
  const search = db.prepare('SELECT rowid AS id FROM fts WHERE fts MATCH ? ORDER BY rank LIMIT ?');
  return {
    vocab: db.prepare('SELECT term, doc FROM vocab').all(),
    find: (match) => (match ? search.all(match, ranking.CANDIDATES).map((row) => row.id) : []),
  };
}

function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

const NOTE_SCORES = {
  whole: (q, key) => dot(q, vectors.note[key]),
  blend: (q, key) =>
    ranking.blendSimilarity(
      dot(q, vectors.note[key]),
      Math.max(-1, ...(sentencesOf[key] ?? []).map((s) => dot(q, s))),
    ),
};

const SHIPPED = {
  name: 'shipped',
  noteScore: 'blend',
  keywordQuery: ranking.keywordQuery,
  keepMeaning: (matches) => ranking.keepMeaning(matches),
  fuse: ranking.fuse,
};

// Search before tuning, as a baseline.
const ORIGINAL = {
  ...SHIPPED,
  name: 'original',
  noteScore: 'whole',
  keywordQuery: (query) => {
    const words = ranking.words(query);
    return words.length ? words.map((w) => `"${w}"*`).join(' ') : null;
  },
  keepMeaning: (matches) => {
    const cutoff = Math.max(0.69, (matches[0]?.similarity ?? 0) - 0.05);
    return matches.filter((m) => m.similarity >= cutoff);
  },
};

const EXPERIMENTS = [ORIGINAL, SHIPPED];

function run(config) {
  const keyword = keywordIndex();
  return EVAL_QUERIES.map((q) => {
    const meaning = SEED_NOTES.map((note) => ({
      id: idOf.get(note.key),
      similarity: NOTE_SCORES[config.noteScore](vectors.query[q.id], note.key),
    }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, ranking.CANDIDATES);
    const byWords = keyword.find(config.keywordQuery(q.query, keyword.vocab));
    const byMeaning = config.keepMeaning(meaning).map((m) => m.id);
    const ids = config.fuse(byWords, byMeaning);
    return { q, keys: ids.map((id) => keyOf.get(id)) };
  });
}

function summary(results, split) {
  return summarize(results.filter((r) => r.q.split === split));
}

console.log(`dev:         ${SUMMARY_HEADER} || test: same`);
for (const config of EXPERIMENTS) {
  const results = run(config);
  console.log(
    `${config.name.padEnd(12)} ${summary(results, 'dev')} || ${summary(results, 'test')}`,
  );
}

const detail = process.argv.find((arg) => arg.startsWith('--detail'))?.split('=')[1];
if (detail) {
  const results = run(EXPERIMENTS.find((c) => c.name === detail));
  console.log(`\n${detail} by category (all splits):`);
  for (const category of [...new Set(EVAL_QUERIES.map((q) => q.category))]) {
    const rows = results.filter((r) => r.q.category === category).map(scoreOne);
    const main = category === 'no-answer' ? average(rows, 'noAnswer') : average(rows, 'ndcg');
    console.log(
      `  ${category.padEnd(14)} ${main.toFixed(3)}  shown ${average(rows, 'shown').toFixed(1)}`,
    );
  }
  for (const { q, keys } of results) {
    const s = scoreOne({ q, keys });
    if ((s.ndcg ?? 1) < 0.6 || s.noAnswer === 0) {
      console.log(`\n[${q.category}] "${q.query}" ndcg=${(s.ndcg ?? 0).toFixed(2)}`);
      console.log(`  want ${JSON.stringify(q.relevant)}\n  got  ${keys.slice(0, 6).join(', ')}`);
    }
  }
}
