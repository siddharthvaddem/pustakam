import { embedNotes } from '../search/embedder';

// Each theme is the average of a few example notes; matching note to note beat matching a bare word.
export const THEMES: { key: string; label: string; examples: string[] }[] = [
  {
    key: 'travel',
    label: 'travel',
    examples: [
      'Booked a flight and a hotel for the trip.',
      'Exploring a new city on holiday, walking around the old town.',
      'Packing my suitcase for a vacation abroad.',
    ],
  },
  {
    key: 'food',
    label: 'food',
    examples: [
      'Cooked dinner tonight and tried a new recipe.',
      'Had an amazing meal at a little restaurant.',
      'Baking bread in the kitchen.',
    ],
  },
  {
    key: 'fitness',
    label: 'fitness',
    examples: [
      'Went for a run this morning.',
      'Workout at the gym, my legs are sore.',
      'Training for a race, did a long run.',
    ],
  },
  {
    key: 'health',
    label: 'health',
    examples: [
      'Feeling sick, went to the doctor.',
      'My back hurts, taking it easy for a few days.',
      'Eating better and drinking more water for my health.',
    ],
  },
  {
    key: 'sleep',
    label: 'sleep',
    examples: [
      'Slept badly and woke up in the night.',
      'Went to bed early and slept eight hours.',
      'Could not fall asleep, lying awake for hours.',
    ],
  },
  {
    key: 'work',
    label: 'work',
    examples: [
      'Busy day at the office with back to back meetings.',
      'The project deadline at work is coming up.',
      'My manager gave me feedback on my work.',
      'We launched the new feature at work and the team celebrated.',
    ],
  },
  {
    key: 'money',
    label: 'money',
    examples: [
      'Checked my budget and savings this month.',
      'Spent too much money, need to save more.',
      'Paid the bills and cancelled a subscription.',
    ],
  },
  {
    key: 'family',
    label: 'family',
    examples: [
      'Called my mom and dad.',
      'Family dinner with my parents and my sister.',
      'Visited my grandparents.',
    ],
  },
  {
    key: 'friends',
    label: 'friends',
    examples: [
      'Hung out with friends tonight.',
      'Talked for hours on the phone with a friend.',
      'Game night with my friends.',
    ],
  },
  {
    key: 'love',
    label: 'love',
    examples: [
      'Date night with my partner.',
      'Feeling close to my partner lately.',
      'We had an argument and then made up.',
    ],
  },
  {
    key: 'home',
    label: 'home',
    examples: [
      'Cleaned and tidied the apartment.',
      'Rearranged the furniture at home.',
      'Cozy evening at home on the couch.',
    ],
  },
  {
    key: 'garden',
    label: 'garden',
    examples: [
      'Watered the plants on the balcony.',
      'Planted seeds in the garden.',
      'The tomatoes in the garden are growing.',
    ],
  },
  {
    key: 'nature',
    label: 'nature',
    examples: [
      'Walk in the woods, the trees were beautiful.',
      'Watched the sunset over the hills.',
      'Hiking up the mountain by the lake.',
    ],
  },
  {
    key: 'music',
    label: 'music',
    examples: [
      'Practiced piano tonight.',
      'Finally played a whole song on the piano.',
      'Listened to a great new album.',
      'Went to a concert.',
    ],
  },
  {
    key: 'reading',
    label: 'reading',
    examples: [
      'Finished reading a great book.',
      'Reading a novel before bed.',
      'Started a new book.',
    ],
  },
  {
    key: 'learning',
    label: 'learning',
    examples: [
      'Learning a new skill with an online course.',
      'Studying a new language every day.',
      'Took a class and learned something new.',
    ],
  },
  {
    key: 'creativity',
    label: 'creativity',
    examples: [
      'Drew a sketch in my notebook.',
      'Painting and making art this afternoon.',
      'Wrote a short story.',
    ],
  },
  {
    key: 'ideas',
    label: 'ideas',
    examples: [
      'Had an idea for a side project.',
      'Brainstormed an idea for an app.',
      'An idea for a small business.',
    ],
  },
  {
    key: 'mood',
    label: 'mood',
    examples: [
      'Feeling happy and light today.',
      'In a low mood, feeling down.',
      'My mood was all over the place.',
    ],
  },
  {
    key: 'gratitude',
    label: 'gratitude',
    examples: [
      'Grateful for the small things today.',
      'Three things I am thankful for.',
      'Feeling lucky and thankful.',
    ],
  },
  {
    key: 'stress',
    label: 'stress',
    examples: [
      'Stressed and overwhelmed, too much to do.',
      'Anxious, I cannot switch off.',
      'Feeling burned out.',
    ],
  },
  {
    key: 'goals',
    label: 'goals',
    examples: [
      'Set a big goal for this year.',
      'Making progress towards my goals.',
      'Planning what I want to achieve.',
    ],
  },
  {
    key: 'habits',
    label: 'habits',
    examples: [
      'Building a new daily habit.',
      'Trying a new morning routine.',
      'Broke my streak but getting back on track.',
    ],
  },
  {
    key: 'shopping',
    label: 'shopping',
    examples: ['Bought new clothes.', 'Ordered something online.', 'Went to the mall.'],
  },
  {
    key: 'gifts',
    label: 'gifts',
    examples: [
      'Gift idea for a birthday.',
      'Wrapped presents for the holidays.',
      'Bought a present for a friend.',
    ],
  },
  {
    key: 'celebrating',
    label: 'celebrating',
    examples: [
      'Birthday party tonight.',
      'Celebrated with dinner and cake.',
      'We toasted to the good news.',
    ],
  },
  {
    key: 'pets',
    label: 'pets',
    examples: [
      'Walked the dog in the park.',
      'My cat slept on my lap all evening.',
      'Took the puppy to the vet.',
    ],
  },
  {
    key: 'movies',
    label: 'movies',
    examples: ['Watched a movie tonight.', 'Binged a TV show all weekend.', 'Went to the cinema.'],
  },
  {
    key: 'sports',
    label: 'sports',
    examples: [
      'Watched the football game.',
      'Played tennis with a friend.',
      'Our team won the match.',
    ],
  },
  {
    key: 'tech',
    label: 'tech',
    examples: [
      'Set up my new laptop.',
      'Fixing a bug in the code.',
      'Trying out a new app on my phone.',
    ],
  },
];

// A note's best theme counts unless it scores below this; scores are relative to the neutral baseline.
const MIN_TOP_SCORE = -0.045;
// Further themes need a positive score within this distance of the best one.
const RUNNER_UP_GAP = 0.03;
const MAX_THEMES_PER_NOTE = 3;

// Broad themes score high on everything; their mean against these is subtracted out.
const NEUTRAL_NOTES = [
  'Today was a day.',
  'A few thoughts from this afternoon.',
  'Quick note before I forget.',
  'Just writing down what happened.',
];

type ThemeVectors = { vectors: number[][]; baseline: number[] };

type ThemeMatch = { theme: number; score: number };

function cosine(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / Math.sqrt(normA * normB);
}

function mean(vectors: number[][]): number[] {
  return vectors[0].map(
    (_, i) => vectors.reduce((sum, vector) => sum + vector[i], 0) / vectors.length,
  );
}

// Per note, its themes (indexes into THEMES), best first.
export function assignThemes(
  noteVectors: ArrayLike<number>[],
  themeVectors: number[][],
  baseline: number[],
): ThemeMatch[][] {
  return noteVectors.map((note) => {
    const ranked = themeVectors
      .map((theme, index) => ({ theme: index, score: cosine(note, theme) - baseline[index] }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (!best || best.score < MIN_TOP_SCORE) return [];
    return ranked
      .filter(
        (match, rank) =>
          rank === 0 || (match.score >= 0 && match.score >= best.score - RUNNER_UP_GAP),
      )
      .slice(0, MAX_THEMES_PER_NOTE);
  });
}

async function embedThemes(): Promise<ThemeVectors> {
  const vectors: number[][] = [];
  for (const theme of THEMES) vectors.push(mean(await embedNotes(theme.examples)));
  const neutral = await embedNotes(NEUTRAL_NOTES);
  const baseline = vectors.map(
    (theme) => neutral.reduce((sum, note) => sum + cosine(theme, note), 0) / neutral.length,
  );
  return { vectors, baseline };
}

let themeVectors: Promise<ThemeVectors> | null = null;

// Depends only on the model, so once per app session; a failure is retried next time.
export function loadThemeVectors(): Promise<ThemeVectors> {
  themeVectors ??= embedThemes().catch((error) => {
    themeVectors = null;
    throw error;
  });
  return themeVectors;
}
