// Keyword boost strength. Moonshine accepts any decimal number; this range matches
// the one its own evaluation script sweeps (0 to 12). Moonshine's default is 2, but
// that misses unusual names like "Siddharth Vaddem", so we start higher. The trade-off:
// the higher it goes, the more likely the model "hears" your words when they weren't said.
export const BOOST_MIN = 0;
export const BOOST_MAX = 12;
export const BOOST_STEP = 0.5;
export const BOOST_DEFAULT = 8;

export function describeBoost(boost: number): string {
  if (boost === 0) return 'Off. Your words are ignored.';
  if (boost <= 2) return 'Gentle. Fixes spelling and capitals, misses unusual names.';
  if (boost < BOOST_DEFAULT) return 'Medium. Catches most names.';
  if (boost === BOOST_DEFAULT) return 'Default. Catches unusual names.';
  return 'Very strong. May hear your words when they weren’t said.';
}
