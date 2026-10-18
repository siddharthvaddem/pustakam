// Labeled test searches over SEED_NOTES (two independent labellers), and their scoring.

export type Grade = 1 | 2; // 2 = what they're looking for, 1 = related

export type Category =
  | 'paraphrase'
  | 'exact-word'
  | 'typo'
  | 'partial-word'
  | 'polarity'
  | 'emotion'
  | 'question'
  | 'long-query'
  | 'one-word'
  | 'multi-topic'
  | 'buried-detail'
  | 'name-attribute'
  | 'word-sense'
  | 'hinglish'
  | 'no-answer';

export type EvalQuery = {
  id: string;
  query: string;
  category: Category;
  split: 'dev' | 'test';
  relevant: Record<string, Grade>;
};

export type Run = { q: EvalQuery; keys: string[] };
type Score = {
  ndcg?: number;
  recall?: number;
  mrr?: number;
  precision?: number;
  noAnswer?: number;
  shown: number;
};

// nDCG@5, recall@10, MRR, precision of what's shown, and empty-when-nothing-matches.
export function scoreOne({ q, keys }: Run): Score {
  const grade = (key: string) => q.relevant[key] ?? 0;
  const relevant = Object.keys(q.relevant);
  if (relevant.length === 0) return { noAnswer: keys.length === 0 ? 1 : 0, shown: keys.length };

  const gain = (g: number) => 2 ** g - 1;
  const dcg = keys
    .slice(0, 5)
    .reduce((sum, key, i) => sum + gain(grade(key)) / Math.log2(i + 2), 0);
  const ideal = relevant
    .map(grade)
    .sort((a, b) => b - a)
    .slice(0, 5)
    .reduce((sum, g, i) => sum + gain(g) / Math.log2(i + 2), 0);
  const best = relevant.filter((key) => grade(key) === 2);
  const target = best.length ? best : relevant;
  const firstHit = keys.findIndex((key) => grade(key) > 0);
  return {
    ndcg: dcg / ideal,
    recall: target.filter((key) => keys.slice(0, 10).includes(key)).length / target.length,
    mrr: firstHit < 0 ? 0 : 1 / (firstHit + 1),
    precision: keys.length ? keys.filter((key) => grade(key) > 0).length / keys.length : 0,
    shown: keys.length,
  };
}

export function average(scores: Score[], field: keyof Score): number {
  const values = scores.map((s) => s[field]).filter((v): v is number => v !== undefined);
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
}

// Don't accept a change that lowers nDCG@5: strict cut-offs raise SCORE by hiding results.
export const SUMMARY_HEADER = 'SCORE | nDCG@5 R@10  MRR   prec  noAns shown';

export function summarize(runs: Run[]): string {
  const scores = runs.map(scoreOne);
  const ndcg = average(scores, 'ndcg');
  const precision = average(scores, 'precision');
  const noAnswer = average(scores, 'noAnswer');
  const score = 0.5 * ndcg + 0.25 * precision + 0.25 * noAnswer;
  const f = (n: number) => n.toFixed(3);
  const shown = average(scores, 'shown').toFixed(1).padStart(4);
  return `${f(score)} | ${f(ndcg)} ${f(average(scores, 'recall'))} ${f(average(scores, 'mrr'))} ${f(precision)} ${f(noAnswer)} ${shown}`;
}

export const EVAL_QUERIES: EvalQuery[] = [
  {
    id: 'para-over-ex',
    query: 'getting over my ex',
    category: 'paraphrase',
    split: 'dev',
    relevant: {
      'neel-breakup': 2,
      'breakup-next-day': 2,
      'ramble-cracked-screen': 2,
      'cant-sleep-photos': 2,
      'arjun-bowling': 2,
      'lonavala-day-trip': 2,
      'neel-texted': 2,
      'mum-told-breakup': 1,
      'friends-dinner': 1,
      'neel-quiet-dinner': 1,
      'flatmate-search': 1,
      'money-tight-rent': 1,
      'ramble-mum-geyser': 1,
      'devika-lunch': 1,
    },
  },
  {
    id: 'para-street-cat',
    query: 'rescued a cat off the street',
    category: 'paraphrase',
    split: 'dev',
    relevant: {
      'biscuit-found': 2,
      'biscuit-vet': 1,
    },
  },
  {
    id: 'para-cardiac',
    query: 'worried I had a cardiac problem',
    category: 'paraphrase',
    split: 'test',
    relevant: {
      'chest-tightness': 2,
      'ecg-waiting': 2,
      'heart-all-clear': 2,
      'back-in-pool': 1,
      'one-coffee': 1,
    },
  },
  {
    id: 'para-roommate',
    query: 'new roommate',
    category: 'paraphrase',
    split: 'dev',
    relevant: {
      'flatmate-search': 2,
      'kabir-moves-in': 2,
      'money-tight-rent': 1,
      'ramble-cracked-screen': 1,
    },
  },
  {
    id: 'para-relative-stayed',
    query: 'a relative stayed over at my place',
    category: 'paraphrase',
    split: 'dev',
    relevant: {
      'rohan-arrives': 2,
      'rohan-leaves': 2,
      'arjun-bowling': 2,
      'rohan-counselling': 1,
      'money-tight-salary': 1,
    },
  },
  {
    id: 'para-adult-swim',
    query: 'learning to swim as a grown up',
    category: 'paraphrase',
    split: 'test',
    relevant: {
      'swim-signup': 2,
      'swim-lesson-1': 2,
      'swim-floating': 2,
      'good-swim-short': 2,
      'deep-end-nervous': 2,
      'deep-end-done': 2,
      'swim-ten-lengths': 2,
      'ramble-cracked-screen': 1,
      'back-in-pool': 1,
      'slept-like-log': 1,
      'salary-credited': 1,
      'pool-closed': 1,
      'goa-sea-swim': 1,
      'goa-beach-day': 1,
      'goa-last-morning': 1,
    },
  },
  {
    id: 'para-plants-struggling',
    query: 'houseplants not doing well',
    category: 'paraphrase',
    split: 'dev',
    relevant: {
      'basil-dying': 2,
      'balcony-plants': 1,
      'basil-new-leaves': 1,
    },
  },
  {
    id: 'exact-fish-curry',
    query: 'fish curry',
    category: 'exact-word',
    split: 'dev',
    relevant: {
      'goa-beach-day': 2,
    },
  },
  {
    id: 'exact-indiranagar',
    query: 'Indiranagar',
    category: 'exact-word',
    split: 'dev',
    relevant: {
      'bangalor-video': 2,
    },
  },
  {
    id: 'exact-khichdi',
    query: 'khichdi',
    category: 'exact-word',
    split: 'test',
    relevant: {
      'ecg-waiting': 2,
    },
  },
  {
    id: 'exact-money-plant',
    query: 'money plant',
    category: 'exact-word',
    split: 'dev',
    relevant: {
      'balcony-plants': 2,
      'basil-dying': 2,
    },
  },
  {
    id: 'exact-pressure-cooker',
    query: 'pressure cooker',
    category: 'exact-word',
    split: 'dev',
    relevant: {
      'kabir-moves-in': 2,
      'bangalor-video': 2,
    },
  },
  {
    id: 'exact-mr-pillai',
    query: 'Mr Pillai',
    category: 'exact-word',
    split: 'test',
    relevant: {
      'swim-lesson-1': 2,
      'swim-floating': 2,
      'deep-end-nervous': 2,
      'deep-end-done': 2,
      'swim-ten-lengths': 2,
      'goa-sea-swim': 2,
    },
  },
  {
    id: 'exact-gerald',
    query: 'Gerald',
    category: 'exact-word',
    split: 'dev',
    relevant: {
      'maya-starter-gerald': 2,
      'sourdough-fail-1': 1,
    },
  },
  {
    id: 'typo-sourdough',
    query: 'sourdoguh',
    category: 'typo',
    split: 'dev',
    relevant: {
      'sourdough-fail-1': 2,
      'sourdough-success': 2,
      'maya-starter-gerald': 2,
      'sourdough-rosemary': 2,
    },
  },
  {
    id: 'typo-priya',
    query: 'Prya',
    category: 'typo',
    split: 'dev',
    relevant: {
      'priya-coffee': 2,
      'priya-tired': 2,
      'priya-doubts': 2,
      'goa-talk': 2,
      'priya-sofa-sleep': 2,
      'priya-exam-pass': 2,
      'pria-movie-night': 2,
      'goa-idea': 1,
      'goa-booked': 1,
      'packing-goa': 1,
      'goa-arrival': 1,
      'goa-beach-day': 1,
      'lonely-sunday': 1,
      'lonavala-day-trip': 1,
      'rohan-counselling': 1,
      'chest-tightness': 1,
      'back-in-pool': 1,
      'friends-dinner': 1,
      'goa-sea-swim': 1,
      'goa-last-morning': 1,
    },
  },
  {
    id: 'typo-guitar',
    query: 'guiter',
    category: 'typo',
    split: 'test',
    relevant: {
      'guitar-start': 2,
      'guitar-progress': 2,
      'guitar-maya': 2,
      'kabir-barre-chords': 2,
      'rain-chai-kabir': 1,
      'packing-goa': 1,
      'rain-guitar-short': 1,
      'meal-prep-sunday': 1,
    },
  },
  {
    id: 'typo-swim-lessons',
    query: 'swiming lessons',
    category: 'typo',
    split: 'dev',
    relevant: {
      'swim-signup': 2,
      'swim-lesson-1': 2,
      'swim-floating': 2,
      'deep-end-nervous': 2,
      'deep-end-done': 2,
      'swim-ten-lengths': 2,
      'ramble-cracked-screen': 1,
      'good-swim-short': 1,
      'back-in-pool': 1,
      'pool-closed': 1,
      'goa-sea-swim': 1,
      'salary-credited': 1,
    },
  },
  {
    id: 'typo-cholesterol',
    query: 'cholestrol',
    category: 'typo',
    split: 'dev',
    relevant: {
      'mum-results-good': 2,
      'walk-with-mum-call': 2,
    },
  },
  {
    id: 'typo-biryani',
    query: 'biryanni',
    category: 'typo',
    split: 'test',
    relevant: {
      'biryani-attempt': 2,
      'mum-cooking-call': 1,
      'cleaning-found-ring': 1,
    },
  },
  {
    id: 'typo-devika',
    query: 'Devka',
    category: 'typo',
    split: 'dev',
    relevant: {
      'devika-lunch': 2,
      'devika-slides-feedback': 2,
      'dev-devika-mixup': 2,
      'devica-onboarding-emails': 2,
      'atlas-named': 1,
      'good-day-bug-fixed': 1,
      'friends-dinner': 1,
      'kabir-band-gig': 1,
      'ran-sprint-meeting': 1,
      'work-dump-devika-half': 2,
      'workday-cat-coffee': 1,
      'reporting-kickoff': 1,
      'first-run-after-goa': 1,
      'review-went-well': 1,
    },
  },
  {
    id: 'partial-sourd',
    query: 'sourd',
    category: 'partial-word',
    split: 'dev',
    relevant: {
      'sourdough-fail-1': 2,
      'sourdough-success': 2,
      'maya-starter-gerald': 2,
      'sourdough-rosemary': 2,
    },
  },
  {
    id: 'partial-indira',
    query: 'Indira',
    category: 'partial-word',
    split: 'dev',
    relevant: {
      'bangalor-video': 2,
    },
  },
  {
    id: 'partial-anj',
    query: 'Anj',
    category: 'partial-word',
    split: 'test',
    relevant: {
      'goa-booked': 2,
      'goa-sea-swim': 2,
    },
  },
  {
    id: 'partial-chole',
    query: 'chole',
    category: 'partial-word',
    split: 'dev',
    relevant: {
      'mum-results-good': 2,
      'walk-with-mum-call': 2,
    },
  },
  {
    id: 'partial-pill',
    query: 'Pill',
    category: 'partial-word',
    split: 'dev',
    relevant: {
      'swim-lesson-1': 2,
      'swim-floating': 2,
      'deep-end-nervous': 2,
      'deep-end-done': 2,
      'swim-ten-lengths': 2,
      'goa-sea-swim': 2,
    },
  },
  {
    id: 'partial-callu',
    query: 'callu',
    category: 'partial-word',
    split: 'test',
    relevant: {
      'guitar-progress': 2,
      'guitar-start': 1,
    },
  },
  {
    id: 'partial-geys',
    query: 'geys',
    category: 'partial-word',
    split: 'dev',
    relevant: {
      'ramble-mum-geyser': 2,
    },
  },
  {
    id: 'pol-slept-well',
    query: 'a night I slept really well',
    category: 'polarity',
    split: 'dev',
    relevant: {
      'slept-well-1': 2,
      'slept-like-log': 2,
      'rest-day': 1,
      reflection: 1,
      'biscuit-sulk': 1,
    },
  },
  {
    id: 'pol-slept-badly',
    query: "couldn't sleep at all",
    category: 'polarity',
    split: 'test',
    relevant: {
      'cant-sleep-1': 2,
      'cant-sleep-2': 2,
      'cant-switch-off': 2,
      'cant-sleep-photos': 2,
      'slept-badly-zoomies': 2,
      'neighbours-party': 2,
      'phone-in-bed': 1,
    },
  },
  {
    id: 'pol-good-work-day',
    query: 'great day at work',
    category: 'polarity',
    split: 'dev',
    relevant: {
      'good-day-bug-fixed': 2,
      'team-praise': 2,
      'reporting-kickoff': 2,
      'review-went-well': 2,
      'launch-day': 2,
      'ran-sprint-meeting': 1,
      'new-project': 1,
    },
  },
  {
    id: 'pol-bad-work-day',
    query: 'terrible day at work',
    category: 'polarity',
    split: 'dev',
    relevant: {
      'atlas-demo-crash': 2,
      'awful-day-dev-server': 2,
      'meeting-dev-tension': 2,
      'overwhelmed-work': 2,
      'work-late-1': 1,
      'workday-cat-coffee': 1,
    },
  },
  {
    id: 'pol-lonely',
    query: 'feeling lonely',
    category: 'polarity',
    split: 'dev',
    relevant: {
      'lonely-sunday': 2,
      'flat-empty-lonely': 2,
      'back-home': 1,
      'rohan-leaves': 1,
      'breakup-next-day': 1,
      'neel-quiet-dinner': 1,
    },
  },
  {
    id: 'pol-connected',
    query: 'felt close to the people around me',
    category: 'polarity',
    split: 'test',
    relevant: {
      'friends-dinner': 2,
      'family-video-call': 2,
      'guitar-maya': 1,
      'goa-arrival': 1,
      'lonavala-day-trip': 1,
      'arjun-bowling': 1,
      'goa-talk': 1,
      'kabir-mum-tiffin': 1,
      'rakhi-arjun': 1,
      'mum-visit-plan': 1,
      'pria-movie-night': 1,
    },
  },
  {
    id: 'pol-money-tight',
    query: 'short on money',
    category: 'polarity',
    split: 'dev',
    relevant: {
      'money-tight-rent': 2,
      'money-tight-salary': 2,
      'rent-increase': 1,
      'budget-sunday': 1,
      'flatmate-search': 1,
    },
  },
  {
    id: 'pol-money-good',
    query: 'finances looking healthy',
    category: 'polarity',
    split: 'dev',
    relevant: {
      'money-on-track': 2,
      'bonus-money-good': 2,
      'laptop-bought': 1,
      reflection: 1,
      'meal-prep-sunday': 1,
      'salary-credited': 1,
    },
  },
  {
    id: 'pol-nervous-before',
    query: 'anxious the night before something big',
    category: 'polarity',
    split: 'test',
    relevant: {
      'review-nervous': 2,
      'deep-end-nervous': 2,
      'arjun-job-hunt': 1,
      'new-project': 1,
      'cant-switch-off': 1,
      'cant-sleep-2': 1,
    },
  },
  {
    id: 'pol-confident-before',
    query: 'felt confident and ready going in',
    category: 'polarity',
    split: 'dev',
    relevant: {
      'review-confident': 2,
      'deep-end-done': 2,
      'launch-week': 1,
      'review-went-well': 1,
    },
  },
  {
    id: 'emo-proud-of-someone',
    query: 'so proud of them',
    category: 'emotion',
    split: 'dev',
    relevant: {
      'arjun-got-job': 2,
      'walk-with-mum-call': 2,
      'arjun-portfolio': 1,
      'priya-exam-pass': 1,
      'rohan-admission': 1,
    },
  },
  {
    id: 'emo-relief',
    query: 'such a relief',
    category: 'emotion',
    split: 'dev',
    relevant: {
      'mum-results-good': 2,
      'heart-all-clear': 2,
      'launch-slip': 2,
      'cleaning-found-ring': 1,
      'salary-credited': 1,
    },
  },
  {
    id: 'emo-heartbroken',
    query: 'heartbroken',
    category: 'emotion',
    split: 'test',
    relevant: {
      'neel-breakup': 2,
      'breakup-next-day': 2,
      'cant-sleep-photos': 1,
      'ramble-cracked-screen': 2,
      'mum-told-breakup': 1,
    },
  },
  {
    id: 'emo-embarrassed',
    query: 'embarrassed',
    category: 'emotion',
    split: 'dev',
    relevant: {
      'atlas-demo-crash': 2,
      'swim-signup': 2,
      'meeting-dev-tension': 1,
      'awful-day-dev-server': 1,
      'swim-lesson-1': 1,
    },
  },
  {
    id: 'emo-grateful-friends',
    query: 'grateful for my friends',
    category: 'emotion',
    split: 'dev',
    relevant: {
      'friends-dinner': 2,
      'breakup-next-day': 2,
      'lonavala-day-trip': 1,
      'race-day': 1,
      'goa-arrival': 1,
      'guitar-maya': 1,
      'ecg-waiting': 1,
      'ramble-cracked-screen': 1,
    },
  },
  {
    id: 'emo-homesick',
    query: 'missing home',
    category: 'emotion',
    split: 'test',
    relevant: {
      'biryani-attempt': 2,
      'mum-cooking-call': 1,
      'kabir-mum-tiffin': 1,
      'mum-visit-plan': 1,
      'arjun-call-passport': 1,
    },
  },
  {
    id: 'emo-anxiety',
    query: 'full of anxiety',
    category: 'emotion',
    split: 'dev',
    relevant: {
      'chest-tightness': 2,
      'cant-sleep-2': 2,
      'overwhelmed-work': 2,
      'heart-all-clear': 2,
      'deep-end-nervous': 2,
      'work-dump-devika-half': 1,
      'ecg-waiting': 1,
      'meeting-dev-tension': 1,
      'back-in-pool': 1,
      'review-nervous': 1,
      'cant-sleep-1': 1,
      'cant-switch-off': 1,
    },
  },
  {
    id: 'q-when-cat',
    query: 'when did we get the cat?',
    category: 'question',
    split: 'dev',
    relevant: {
      'biscuit-found': 2,
      'biscuit-vet': 1,
    },
  },
  {
    id: 'q-10k-time',
    query: 'how long did my 10k take',
    category: 'question',
    split: 'dev',
    relevant: {
      'race-day': 2,
      'run-plan': 1,
    },
  },
  {
    id: 'q-ecg-result',
    query: 'did my ECG come back normal?',
    category: 'question',
    split: 'test',
    relevant: {
      'heart-all-clear': 2,
      'ecg-waiting': 1,
      'chest-tightness': 1,
    },
  },
  {
    id: 'q-mum-breakup',
    query: 'what did mum say when I told her about the breakup',
    category: 'question',
    split: 'dev',
    relevant: {
      'mum-told-breakup': 2,
      'ramble-mum-geyser': 1,
    },
  },
  {
    id: 'q-barre-chords',
    query: 'who taught me barre chords',
    category: 'question',
    split: 'dev',
    relevant: {
      'kabir-barre-chords': 2,
    },
  },
  {
    id: 'q-rent-up',
    query: 'how much did the rent go up?',
    category: 'question',
    split: 'test',
    relevant: {
      'rent-increase': 2,
    },
  },
  {
    id: 'q-rohan-college',
    query: 'what is Rohan going to study',
    category: 'question',
    split: 'dev',
    relevant: {
      'rohan-admission': 2,
      'rohan-counselling': 2,
      'ramble-mum-geyser': 1,
      'rohan-arrives': 1,
    },
  },
  {
    id: 'long-cousin-money',
    query:
      'that week my cousin was staying over and money got really tight because feeding him cost so much',
    category: 'long-query',
    split: 'dev',
    relevant: {
      'money-tight-salary': 2,
      'rohan-arrives': 1,
      'rohan-counselling': 1,
      'rohan-leaves': 1,
      'salary-credited': 1,
    },
  },
  {
    id: 'long-orange-cat',
    query: 'the time my flatmate brought home a little orange cat he found by the rubbish',
    category: 'long-query',
    split: 'dev',
    relevant: {
      'biscuit-found': 2,
      'biscuit-vet': 1,
    },
  },
  {
    id: 'long-doctor-friend-sofa',
    query:
      'when my friend who is a doctor came over after a long shift and fell asleep on our couch',
    category: 'long-query',
    split: 'test',
    relevant: {
      'priya-sofa-sleep': 2,
      'priya-tired': 1,
      'pria-movie-night': 1,
      'goa-beach-day': 1,
    },
  },
  {
    id: 'long-chest-pain-tests',
    query: 'the afternoon I had chest pain at work and had to go and get tests done',
    category: 'long-query',
    split: 'dev',
    relevant: {
      'chest-tightness': 2,
      'ecg-waiting': 2,
      'heart-all-clear': 1,
    },
  },
  {
    id: 'long-demo-broke',
    query:
      'remember when the product demo broke in front of the customer and my manager had to say sorry',
    category: 'long-query',
    split: 'dev',
    relevant: {
      'atlas-demo-crash': 2,
      'good-day-bug-fixed': 1,
    },
  },
  {
    id: 'long-which-laptop',
    query: 'trying to decide which laptop to buy and whether the expensive one is really worth it',
    category: 'long-query',
    split: 'test',
    relevant: {
      'apple-store': 2,
      'laptop-bought': 1,
      'budget-sunday': 1,
      'money-on-track': 1,
      'meal-prep-sunday': 1,
      'bonus-money-good': 1,
    },
  },
  {
    id: 'long-brother-cheer-up',
    query: 'my brother coming all the way to visit to cheer me up after my relationship ended',
    category: 'long-query',
    split: 'dev',
    relevant: {
      'arjun-bowling': 2,
    },
  },
  {
    id: 'one-biscuit',
    query: 'Biscuit',
    category: 'one-word',
    split: 'dev',
    relevant: {
      'biscuit-found': 2,
      'biscuit-vet': 2,
      'biscuit-keyboard': 2,
      'slept-badly-zoomies': 2,
      'biscuit-sulk': 2,
      'workday-cat-coffee': 1,
      'friends-dinner': 1,
      'caught-cold': 1,
      'shimla-apples': 1,
      'kabir-barre-chords': 1,
      'flat-empty-lonely': 1,
      'meal-prep-sunday': 1,
      'kabir-race-playlist': 1,
      'review-nervous': 1,
      'bank-card-blocked': 1,
    },
  },
  {
    id: 'one-swimming',
    query: 'swimming',
    category: 'one-word',
    split: 'test',
    relevant: {
      'swim-signup': 2,
      'swim-lesson-1': 2,
      'swim-floating': 2,
      'good-swim-short': 2,
      'deep-end-nervous': 2,
      'deep-end-done': 2,
      'back-in-pool': 2,
      'swim-ten-lengths': 2,
      'goa-sea-swim': 2,
      'pool-closed': 1,
      'slept-like-log': 1,
      'salary-credited': 1,
      'ramble-cracked-screen': 1,
      'goa-beach-day': 1,
      'goa-last-morning': 1,
    },
  },
  {
    id: 'one-neel',
    query: 'Neel',
    category: 'one-word',
    split: 'dev',
    relevant: {
      'neel-quiet-dinner': 2,
      'neel-breakup': 2,
      'breakup-next-day': 2,
      'ramble-cracked-screen': 2,
      'mum-told-breakup': 2,
      'cant-sleep-photos': 2,
      'neel-texted': 2,
      'flatmate-search': 1,
      'money-tight-rent': 1,
      'ramble-mum-geyser': 1,
      'arjun-bowling': 1,
      'lonavala-day-trip': 1,
      'friends-dinner': 1,
    },
  },
  {
    id: 'one-rohan',
    query: 'Rohan',
    category: 'one-word',
    split: 'dev',
    relevant: {
      'rohan-arrives': 2,
      'rohan-counselling': 2,
      'rohan-leaves': 2,
      'rohan-admission': 2,
      'money-tight-salary': 1,
      'ramble-mum-geyser': 1,
      'family-video-call': 1,
    },
  },
  {
    id: 'one-basil',
    query: 'basil',
    category: 'one-word',
    split: 'dev',
    relevant: {
      'balcony-plants': 2,
      'basil-dying': 2,
      'basil-new-leaves': 2,
    },
  },
  {
    id: 'one-bangalore',
    query: 'Bangalore',
    category: 'one-word',
    split: 'test',
    relevant: {
      'arjun-job-hunt': 2,
      'arjun-got-job': 2,
      'arjun-moving': 2,
      'arjun-moved': 2,
      'bangalor-video': 2,
      'goa-talk': 1,
      'river-bank-walk': 1,
      'arjun-portfolio': 1,
      'arjun-tired': 1,
      'arjun-call-passport': 1,
    },
  },
  {
    id: 'one-rent',
    query: 'rent',
    category: 'one-word',
    split: 'dev',
    relevant: {
      'rent-increase': 2,
      'money-tight-rent': 2,
      'salary-credited': 1,
      'flatmate-search': 1,
    },
  },
  {
    id: 'multi-kabir-cat',
    query: 'Kabir and the cat',
    category: 'multi-topic',
    split: 'dev',
    relevant: {
      'biscuit-found': 2,
      'biscuit-sulk': 2,
      'kabir-barre-chords': 1,
      'shimla-apples': 1,
      'friends-dinner': 1,
      'caught-cold': 1,
      'meal-prep-sunday': 1,
      'kabir-race-playlist': 1,
      'flat-empty-lonely': 1,
      'workday-cat-coffee': 1,
    },
  },
  {
    id: 'multi-goa-swim',
    query: 'swimming in Goa',
    category: 'multi-topic',
    split: 'dev',
    relevant: {
      'goa-sea-swim': 2,
      'goa-beach-day': 2,
      'goa-last-morning': 2,
    },
  },
  {
    id: 'multi-mum-cooking',
    query: 'mum teaching me to cook',
    category: 'multi-topic',
    split: 'test',
    relevant: {
      'mum-cooking-call': 2,
      'biryani-attempt': 2,
      'meal-prep-sunday': 1,
    },
  },
  {
    id: 'multi-devika-running',
    query: 'Devika and running',
    category: 'multi-topic',
    split: 'dev',
    relevant: {
      'work-dump-devika-half': 2,
      'first-run-after-goa': 2,
    },
  },
  {
    id: 'multi-maya-bangalore',
    query: 'Maya moving to Bangalore',
    category: 'multi-topic',
    split: 'dev',
    relevant: {
      'goa-talk': 2,
      'river-bank-walk': 2,
      'arjun-call-passport': 2,
    },
  },
  {
    id: 'multi-priya-heart',
    query: 'Priya and my heart scare',
    category: 'multi-topic',
    split: 'test',
    relevant: {
      'chest-tightness': 2,
      'back-in-pool': 2,
      'ecg-waiting': 1,
      'heart-all-clear': 1,
    },
  },
  {
    id: 'multi-budget-home-cooking',
    query: 'budget and home cooking',
    category: 'multi-topic',
    split: 'dev',
    relevant: {
      'budget-sunday': 2,
      'money-on-track': 2,
      'meal-prep-sunday': 2,
      'laptop-bought': 2,
      'money-tight-salary': 1,
      'money-tight-rent': 1,
    },
  },
  {
    id: 'buried-cat-coffee',
    query: 'cat spilled coffee on my notebook',
    category: 'buried-detail',
    split: 'dev',
    relevant: {
      'workday-cat-coffee': 2,
    },
  },
  {
    id: 'buried-hot-water',
    query: 'hot water fixed',
    category: 'buried-detail',
    split: 'dev',
    relevant: {
      'ramble-mum-geyser': 2,
    },
  },
  {
    id: 'buried-phone-screen',
    query: 'phone screen broke',
    category: 'buried-detail',
    split: 'test',
    relevant: {
      'ramble-cracked-screen': 2,
    },
  },
  {
    id: 'buried-maya-birthday',
    query: "when is Maya's birthday",
    category: 'buried-detail',
    split: 'dev',
    relevant: {
      'meal-prep-sunday': 2,
    },
  },
  {
    id: 'buried-devika-half',
    query: "Devika's half marathon",
    category: 'buried-detail',
    split: 'dev',
    relevant: {
      'work-dump-devika-half': 2,
      'first-run-after-goa': 2,
    },
  },
  {
    id: 'buried-grandmother-ring',
    query: "grandmother's ring",
    category: 'buried-detail',
    split: 'test',
    relevant: {
      'cleaning-found-ring': 2,
    },
  },
  {
    id: 'buried-passport',
    query: 'passport expiry',
    category: 'buried-detail',
    split: 'dev',
    relevant: {
      'arjun-call-passport': 2,
    },
  },
  {
    id: 'name-kabir-job',
    query: 'what does Kabir do for work',
    category: 'name-attribute',
    split: 'dev',
    relevant: {
      'flatmate-search': 2,
      'kabir-band-gig': 1,
      'lonely-sunday': 1,
    },
  },
  {
    id: 'name-maya-job',
    query: "Maya's job",
    category: 'name-attribute',
    split: 'dev',
    relevant: {
      'maya-tired': 2,
      'river-bank-walk': 1,
    },
  },
  {
    id: 'name-dev-feedback',
    query: "Dev's feedback on me",
    category: 'name-attribute',
    split: 'test',
    relevant: {
      'dev-one-on-one': 2,
      'meeting-dev-tension': 2,
      'team-praise': 2,
      'good-day-bug-fixed': 1,
      'review-went-well': 1,
      'new-project': 1,
      'awful-day-dev-server': 1,
      'cant-sleep-1': 1,
    },
  },
  {
    id: 'name-devika-feedback',
    query: "Devika's feedback on me",
    category: 'name-attribute',
    split: 'dev',
    relevant: {
      'devika-slides-feedback': 2,
      'ran-sprint-meeting': 1,
    },
  },
  {
    id: 'name-swim-teacher',
    query: "swim teacher's name",
    category: 'name-attribute',
    split: 'dev',
    relevant: {
      'swim-lesson-1': 2,
      'swim-floating': 1,
      'deep-end-nervous': 1,
      'deep-end-done': 1,
      'swim-ten-lengths': 1,
      'goa-sea-swim': 1,
    },
  },
  {
    id: 'name-priya-specialty',
    query: 'Priya changing specialty',
    category: 'name-attribute',
    split: 'dev',
    relevant: {
      'goa-talk': 2,
      'priya-doubts': 1,
    },
  },
  {
    id: 'name-cat-age',
    query: 'how old is Biscuit',
    category: 'name-attribute',
    split: 'test',
    relevant: {
      'biscuit-vet': 2,
    },
  },
  {
    id: 'name-arjun-area',
    query: 'which area does Arjun live in',
    category: 'name-attribute',
    split: 'dev',
    relevant: {
      'bangalor-video': 2,
      'arjun-moving': 1,
      'arjun-moved': 1,
    },
  },
  {
    id: 'sense-went-running',
    query: 'went for a run',
    category: 'word-sense',
    split: 'dev',
    relevant: {
      'run-plan': 2,
      'run-2': 2,
      'knee-better': 2,
      'long-run': 2,
      'race-day': 2,
      'rain-run-5k': 2,
      'first-run-after-goa': 2,
      'knee-pain': 1,
      'meal-prep-sunday': 1,
      'post-race-sore': 1,
      'swim-ten-lengths': 1,
      reflection: 1,
      'kabir-race-playlist': 1,
      'work-dump-devika-half': 1,
    },
  },
  {
    id: 'sense-ran-out',
    query: 'ran out of groceries',
    category: 'word-sense',
    split: 'dev',
    relevant: {
      'ran-out-milk': 2,
    },
  },
  {
    id: 'sense-ran-meeting',
    query: 'running the meeting',
    category: 'word-sense',
    split: 'test',
    relevant: {
      'ran-sprint-meeting': 2,
    },
  },
  {
    id: 'sense-apple-laptop',
    query: 'Apple laptop',
    category: 'word-sense',
    split: 'dev',
    relevant: {
      'apple-store': 2,
      'laptop-bought': 1,
    },
  },
  {
    id: 'sense-eating-apples',
    query: 'eating apples',
    category: 'word-sense',
    split: 'test',
    relevant: {
      'shimla-apples': 2,
    },
  },
  {
    id: 'sense-bank-account',
    query: 'bank account',
    category: 'word-sense',
    split: 'dev',
    relevant: {
      'salary-credited': 2,
      'bank-card-blocked': 2,
    },
  },
  {
    id: 'sense-river-bank',
    query: 'sitting by the river bank',
    category: 'word-sense',
    split: 'test',
    relevant: {
      'river-bank-walk': 2,
    },
  },
  {
    id: 'sense-caught-cold',
    query: 'caught a cold',
    category: 'word-sense',
    split: 'dev',
    relevant: {
      'caught-cold': 2,
    },
  },
  {
    id: 'hi-ghar-ka-khana',
    query: 'ghar ka khana',
    category: 'hinglish',
    split: 'dev',
    relevant: {
      'kabir-mum-tiffin': 2,
      'rakhi-arjun': 1,
      'mum-cooking-call': 1,
      'biryani-attempt': 1,
    },
  },
  {
    id: 'hi-kabir-chai',
    query: 'Kabir ke saath chai',
    category: 'hinglish',
    split: 'dev',
    relevant: {
      'kabir-moves-in': 2,
      'rain-chai-kabir': 2,
      'one-coffee': 1,
    },
  },
  {
    id: 'hi-paise-tangi',
    query: 'paise ki tangi',
    category: 'hinglish',
    split: 'test',
    relevant: {
      'money-tight-rent': 2,
      'money-tight-salary': 2,
      'rent-increase': 1,
      'budget-sunday': 1,
      'flatmate-search': 1,
    },
  },
  {
    id: 'hi-neend-nahi',
    query: 'neend nahi aayi',
    category: 'hinglish',
    split: 'dev',
    relevant: {
      'cant-sleep-1': 2,
      'cant-sleep-2': 2,
      'cant-switch-off': 2,
      'cant-sleep-photos': 2,
      'slept-badly-zoomies': 2,
      'neighbours-party': 2,
      'phone-in-bed': 1,
    },
  },
  {
    id: 'hi-mummy-tabiyat',
    query: 'mummy ki tabiyat',
    category: 'hinglish',
    split: 'dev',
    relevant: {
      'mum-call-checkup': 2,
      'mum-results-good': 2,
      'walk-with-mum-call': 2,
      'ramble-mum-geyser': 1,
      'mum-tired-ganpati': 1,
      'arjun-call-passport': 1,
    },
  },
  {
    id: 'hi-bhai-naya-ghar',
    query: 'bhai ka naya ghar Bangalore mein',
    category: 'hinglish',
    split: 'test',
    relevant: {
      'arjun-moved': 2,
      'bangalor-video': 2,
      'arjun-moving': 2,
      'arjun-tired': 1,
      'arjun-got-job': 1,
      'arjun-call-passport': 1,
    },
  },
  {
    id: 'hi-dosto-ghoomna',
    query: 'dosto ke saath ghoomna',
    category: 'hinglish',
    split: 'dev',
    relevant: {
      'lonavala-day-trip': 2,
      'goa-arrival': 2,
      'goa-beach-day': 2,
      'river-bank-walk': 1,
      'goa-last-morning': 2,
      'goa-booked': 1,
      'goa-idea': 1,
      'kabir-band-gig': 1,
      'goa-sea-swim': 1,
      'goa-talk': 1,
    },
  },
  {
    id: 'none-dentist',
    query: 'dentist appointment',
    category: 'no-answer',
    split: 'dev',
    relevant: {},
  },
  {
    id: 'none-car',
    query: 'car broke down',
    category: 'no-answer',
    split: 'test',
    relevant: {},
  },
  {
    id: 'none-wedding',
    query: "cousin's wedding",
    category: 'no-answer',
    split: 'dev',
    relevant: {},
  },
  {
    id: 'none-snow',
    query: 'trip to see the snow',
    category: 'no-answer',
    split: 'dev',
    relevant: {},
  },
  {
    id: 'none-dog',
    query: 'walking the dog',
    category: 'no-answer',
    split: 'test',
    relevant: {},
  },
  {
    id: 'none-piano',
    query: 'piano lessons',
    category: 'no-answer',
    split: 'dev',
    relevant: {},
  },
  {
    id: 'none-taxes',
    query: 'filing my taxes',
    category: 'no-answer',
    split: 'dev',
    relevant: {},
  },
  {
    id: 'none-football',
    query: 'football match',
    category: 'no-answer',
    split: 'test',
    relevant: {},
  },
  {
    id: 'none-visa',
    query: 'visa application',
    category: 'no-answer',
    split: 'dev',
    relevant: {},
  },
  {
    id: 'none-driving',
    query: 'driving lessons',
    category: 'no-answer',
    split: 'dev',
    relevant: {},
  },
  {
    id: 'none-paris',
    query: 'trip to Paris',
    category: 'no-answer',
    split: 'test',
    relevant: {},
  },
  {
    id: 'none-broken-arm',
    query: 'broke my arm',
    category: 'no-answer',
    split: 'dev',
    relevant: {},
  },
];
