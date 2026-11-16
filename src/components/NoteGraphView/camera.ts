// Screen = world * scale + (x, y).
export type Camera = { x: number; y: number; scale: number };
type Bounds = { minX: number; minY: number; maxX: number; maxY: number };
type Area = { width: number; height: number };
type Range = [min: number, max: number];

export const MIN_SCALE = 0.3;
export const MAX_SCALE = 4;
const FIT_PADDING = 48;
// How much of the graph must stay on screen after a fling.
const KEEP_VISIBLE = 80;

export function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(max, Math.max(min, value));
}

// Bounds of the given node indexes, or of every node when none are given.
export function boundsOf(points: number[], indexes?: number[]): Bounds {
  'worklet';
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const count = indexes ? indexes.length : points.length / 2;
  for (let n = 0; n < count; n++) {
    const i = indexes ? indexes[n] : n;
    bounds.minX = Math.min(bounds.minX, points[i * 2]);
    bounds.maxX = Math.max(bounds.maxX, points[i * 2]);
    bounds.minY = Math.min(bounds.minY, points[i * 2 + 1]);
    bounds.maxY = Math.max(bounds.maxY, points[i * 2 + 1]);
  }
  return bounds;
}

export function fitBounds(bounds: Bounds, area: Area, maxScale: number): Camera {
  'worklet';
  const scale = clamp(
    Math.min(
      (area.width - FIT_PADDING * 2) / Math.max(bounds.maxX - bounds.minX, 1),
      (area.height - FIT_PADDING * 2) / Math.max(bounds.maxY - bounds.minY, 1),
    ),
    MIN_SCALE,
    maxScale,
  );
  return {
    scale,
    x: area.width / 2 - ((bounds.minX + bounds.maxX) / 2) * scale,
    y: area.height / 2 - ((bounds.minY + bounds.maxY) / 2) * scale,
  };
}

// Translate ranges for a fling that keep part of the graph on screen; they always include `camera`.
export function panLimits(
  bounds: Bounds,
  camera: Camera,
  width: number,
  height: number,
): { x: Range; y: Range } {
  'worklet';
  const { x, y, scale } = camera;
  return {
    x: [
      Math.min(x, KEEP_VISIBLE - bounds.maxX * scale),
      Math.max(x, width - KEEP_VISIBLE - bounds.minX * scale),
    ],
    y: [
      Math.min(y, KEEP_VISIBLE - bounds.maxY * scale),
      Math.max(y, height - KEEP_VISIBLE - bounds.minY * scale),
    ],
  };
}
