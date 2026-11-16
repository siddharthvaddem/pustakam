const STAR_COUNT = 120;
export const STAR_PARALLAX = 0.3;

// Mulberry32, so the stars sit in the same places on every launch.
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = seeded(7);

// x, y in 0..1 of the canvas, then a radius in points; flat so worklets copy it cheaply.
export const STARS: number[] = Array.from({ length: STAR_COUNT }, () => [
  random(),
  random(),
  0.5 + random() * 0.7,
]).flat();
