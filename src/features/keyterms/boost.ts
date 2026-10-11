// Keyword boost strength. Moonshine accepts any decimal number; this range matches
// the one its own evaluation script sweeps (0 to 12). Moonshine's default is 2, which
// misses unusual names. In our tests 4 caught uncommon first and last names, while 8
// got stuck repeating keywords and dropped the rest of the sentence.
export const BOOST_MIN = 0;
export const BOOST_MAX = 12;
export const BOOST_STEP = 0.5;
export const BOOST_DEFAULT = 4;

export function describeBoost(boost: number): string {
  if (boost === 0) return 'Off. Your words are ignored.';
  if (boost < BOOST_DEFAULT) return 'Gentle. Fixes spelling and capitals, may miss unusual names.';
  if (boost === BOOST_DEFAULT) return 'Default. Catches unusual names.';
  if (boost <= 6) return 'Strong. May hear your words when they weren’t said.';
  return 'Very strong. Can get stuck repeating your words.';
}
