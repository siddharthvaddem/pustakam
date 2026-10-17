import LiteRtLm, { type Backend } from '../../modules/litert-lm';
import { SEED_NOTES } from './seedNotes';

const ms = (n: number) => `${Math.round(n)} ms`;

// Vectors are normalized, so the dot product is the cosine similarity.
function similarity(a: number[], b: number[]): number {
  return a.reduce((sum, value, i) => sum + value * b[i], 0);
}

function seedText(key: string): string {
  return `title: none | text: ${SEED_NOTES.find((n) => n.key === key)?.text}`;
}

/** Times the embedding model on 50 sample notes and returns a summary to show. */
export async function measureEmbeddingSpeed(modelPath: string, backend: Backend): Promise<string> {
  const loadStart = performance.now();
  await LiteRtLm.loadEmbedder(modelPath, backend);
  const loadMs = performance.now() - loadStart;

  try {
    // Also warms the model up, so it's left out of the timings.
    const [query] = await LiteRtLm.embed(['task: search result | query: burned out at work']);

    const times: number[] = [];
    for (const note of SEED_NOTES.slice(0, 50)) {
      const start = performance.now();
      await LiteRtLm.embed([`title: none | text: ${note.text}`]);
      times.push(performance.now() - start);
    }
    times.sort((a, b) => a - b);
    const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
    const p95 = times[Math.floor(times.length * 0.95)];

    // Sanity check: the work-stress note should score higher than the cooking one.
    const [stress, cooking] = await LiteRtLm.embed([
      seedText('overwhelmed-work'),
      seedText('biryani-attempt'),
    ]);
    const related = similarity(query, stress).toFixed(2);
    const unrelated = similarity(query, cooking).toFixed(2);

    return [
      `${backend.toUpperCase()}: load ${ms(loadMs)}, avg ${ms(avg)}, p95 ${ms(p95)}`,
      `${query.length} dimensions · related ${related} vs unrelated ${unrelated}`,
    ].join('\n');
  } finally {
    await LiteRtLm.closeEmbedder();
  }
}
