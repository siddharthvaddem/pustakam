// Pure ranking logic, so scripts/search-eval.mjs can test exactly what the app runs.

const MIN_SIMILARITY = 0.73;
const MAX_GAP_FROM_BEST = 0.065;
export const CANDIDATES = 30;
const RESULTS = 20;

export type MeaningMatch = { id: number; similarity: number };
export type VocabTerm = { term: string; doc: number };

const STOPWORDS = new Set(
  'i me my we our you your he she they them the a an and or of to in on at for with about from by is was were be been am are did do does had has have that this it its when what which who how why where there then so as just really very got get'.split(
    ' ',
  ),
);

export function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export function sentences(text: string): string[] {
  const found = text.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()) ?? [];
  return found.filter(Boolean);
}

// Half the whole note, half its best sentence, so a detail in a long note still counts.
export function blendSimilarity(whole: number, bestSentence: number): number {
  return 0.5 * whole + 0.5 * Math.max(whole, bestSentence);
}

function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const swap = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      row[j] = Math.min(previous[j] + 1, row[j - 1] + 1, swap);
    }
    previous = row;
  }
  return previous[b.length];
}

// A word that starts no word in the notes becomes the closest one that does ("sourdoguh").
function correctTypo(word: string, vocab: VocabTerm[]): string {
  if (word.length < 4 || vocab.some((v) => v.term.startsWith(word))) return word;
  const max = word.length <= 5 ? 1 : 2;
  let best: (VocabTerm & { distance: number }) | null = null;
  for (const v of vocab) {
    const distance = editDistance(word, v.term, max);
    if (distance > max) continue;
    if (!best || distance < best.distance || (distance === best.distance && v.doc > best.doc)) {
      best = { ...v, distance };
    }
  }
  return best ? best.term : word;
}

// "when did Priya's cat" -> "priya"* "s"* "cat"* (all must appear, as prefixes).
export function keywordQuery(query: string, vocab: VocabTerm[]): string | null {
  const kept = words(query)
    .filter((word) => !STOPWORDS.has(word))
    .map((word) => correctTypo(word, vocab));
  return kept.length ? kept.map((word) => `"${word}"*`).join(' ') : null;
}

export function keepMeaning(matches: MeaningMatch[]): MeaningMatch[] {
  const cutoff = Math.max(MIN_SIMILARITY, (matches[0]?.similarity ?? 0) - MAX_GAP_FROM_BEST);
  return matches.filter((match) => match.similarity >= cutoff);
}

// Reciprocal rank fusion of two best-first id lists.
export function fuse(byWords: number[], byMeaning: number[]): number[] {
  const scores = new Map<number, number>();
  const add = (ids: number[]) =>
    ids.forEach((id, rank) => scores.set(id, (scores.get(id) ?? 0) + 1 / (60 + rank)));
  add(byWords);
  add(byMeaning);
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, RESULTS)
    .map(([id]) => id);
}
