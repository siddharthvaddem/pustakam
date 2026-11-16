import { PaintStyle, Skia, type SkCanvas, type SkFont, TileMode } from '@shopify/react-native-skia';
import { type Camera, clamp } from './camera';
import { STAR_PARALLAX, STARS } from './starfield';

export const THEME_LABEL_SIZE = 13;
export const NOTE_LABEL_SIZE = 10;
const NOTE_LABELS_FROM_ZOOM = 1.8;
const NOTE_LABEL_FADE = 0.4;
const RING_GAP = 3;
const RING_GROWTH = 5;
const COUNT_GAP = 5;
const LABEL_PADDING = 4;

// Fixed for a given graph, theme and fonts.
export type Scene = {
  isTheme: boolean[];
  radii: number[];
  labels: string[];
  labelWidths: number[];
  counts: string[];
  countWidths: number[];
  // Theme indexes, biggest first; their labels win when two would overlap.
  labelOrder: number[];
  linkEnds: number[];
  neighbors: number[][];
  colors: { accent: string; background: string; text: string; textMuted: string };
  // Brightest to darkest, so hubs read as small spheres.
  sphere: [string, string, string];
  starAlpha: number;
  themeFont: SkFont | null;
  noteFont: SkFont | null;
};

export type Frame = {
  points: number[];
  camera: Camera;
  // Scale relative to the whole-graph view.
  zoom: number;
  width: number;
  height: number;
  focus: number;
  // 0..1 entry fade, and 0..1 selection ring.
  appear: number;
  ring: number;
};

// Nodes grow slower than the zoom so they stay visible zoomed out and modest zoomed in.
export function nodeScale(scale: number): number {
  'worklet';
  return Math.sqrt(scale);
}

function withAlpha(hex: string, alpha: number): Float32Array {
  'worklet';
  const color = Skia.Color(hex);
  return Float32Array.of(color[0], color[1], color[2], alpha);
}

function wrap(value: number, size: number): number {
  'worklet';
  return ((value % size) + size) % size;
}

export function drawGraph(canvas: SkCanvas, scene: Scene, frame: Frame) {
  'worklet';
  const {
    isTheme,
    radii,
    labels,
    labelWidths,
    counts,
    countWidths,
    labelOrder,
    linkEnds,
    neighbors,
  } = scene;
  const { accent, background, text, textMuted } = scene.colors;
  const { points, camera, width, height, focus, appear, ring } = frame;
  const count = radii.length;
  if (points.length !== count * 2 || width === 0) return;

  const s = camera.scale;
  const grow = nodeScale(s);
  const hubGrow = grow * (0.6 + 0.4 * appear);
  const focused = focus >= 0;
  const lit: boolean[] = new Array(count).fill(!focused);
  if (focused) {
    lit[focus] = true;
    for (const other of neighbors[focus]) lit[other] = true;
  }
  const sx = (i: number) => points[i * 2] * s + camera.x;
  const sy = (i: number) => points[i * 2 + 1] * s + camera.y;

  const fading = appear < 1;
  if (fading) {
    const layer = Skia.Paint();
    layer.setAlphaf(appear);
    canvas.saveLayer(layer);
  }

  const starPaint = Skia.Paint();
  starPaint.setAntiAlias(true);
  starPaint.setColor(withAlpha(textMuted, scene.starAlpha));
  for (let i = 0; i < STARS.length; i += 3) {
    canvas.drawCircle(
      wrap(STARS[i] * width + camera.x * STAR_PARALLAX, width),
      wrap(STARS[i + 1] * height + camera.y * STAR_PARALLAX, height),
      STARS[i + 2],
      starPaint,
    );
  }

  const restLinks = Skia.Path.Make();
  const litLinks = Skia.Path.Make();
  for (let l = 0; l < linkEnds.length; l += 2) {
    const a = linkEnds[l];
    const b = linkEnds[l + 1];
    const path = focused && (a === focus || b === focus) ? litLinks : restLinks;
    path.moveTo(sx(a), sy(a));
    path.lineTo(sx(b), sy(b));
  }
  const linkPaint = Skia.Paint();
  linkPaint.setStyle(PaintStyle.Stroke);
  linkPaint.setStrokeWidth(1);
  linkPaint.setAntiAlias(true);
  linkPaint.setColor(withAlpha(textMuted, focused ? 0.06 : 0.25));
  canvas.drawPath(restLinks, linkPaint);
  linkPaint.setColor(withAlpha(accent, 0.65));
  canvas.drawPath(litLinks, linkPaint);

  const dotPaint = Skia.Paint();
  dotPaint.setAntiAlias(true);
  for (let i = 0; i < count; i++) {
    if (isTheme[i]) continue;
    dotPaint.setColor(withAlpha(accent, focused ? (lit[i] ? 0.9 : 0.12) : 0.5));
    canvas.drawCircle(sx(i), sy(i), radii[i] * grow, dotPaint);
  }

  // Outlined in the background colour so labels stay legible over links.
  const outline = Skia.Paint();
  outline.setStyle(PaintStyle.Stroke);
  outline.setStrokeWidth(4);
  outline.setAntiAlias(true);
  outline.setColor(Skia.Color(background));
  const labelPaint = Skia.Paint();
  labelPaint.setAntiAlias(true);
  const drawLabel = (label: string, x: number, y: number, font: SkFont, color: Float32Array) => {
    labelPaint.setColor(color);
    canvas.drawText(label, x, y, outline, font);
    canvas.drawText(label, x, y, labelPaint, font);
  };

  const { themeFont, noteFont } = scene;
  if (noteFont) {
    const zoomedIn = clamp((frame.zoom - NOTE_LABELS_FROM_ZOOM) / NOTE_LABEL_FADE, 0, 1);
    for (let i = 0; i < count; i++) {
      if (isTheme[i]) continue;
      const alpha = focused && lit[i] ? 1 : zoomedIn * (focused ? 0.3 : 1);
      const x = sx(i) + radii[i] * grow + 4;
      const y = sy(i) + NOTE_LABEL_SIZE / 3;
      if (alpha <= 0 || x > width || y < 0 || y > height + NOTE_LABEL_SIZE) continue;
      drawLabel(labels[i], x, y, noteFont, withAlpha(textMuted, alpha));
    }
  }

  const hubPaint = Skia.Paint();
  hubPaint.setAntiAlias(true);
  const sphereColors = scene.sphere.map((hex) => Skia.Color(hex));
  for (let i = 0; i < count; i++) {
    if (!isTheme[i]) continue;
    const x = sx(i);
    const y = sy(i);
    const r = radii[i] * hubGrow;
    const alpha = lit[i] ? 1 : 0.25;
    hubPaint.setShader(
      Skia.Shader.MakeRadialGradient(
        { x: x - r * 0.35, y: y - r * 0.35 },
        r * 1.35,
        sphereColors,
        [0, 0.55, 1],
        TileMode.Clamp,
      ),
    );
    hubPaint.setAlphaf(alpha);
    canvas.drawCircle(x, y, r, hubPaint);
  }

  if (focused) {
    const ringPaint = Skia.Paint();
    ringPaint.setStyle(PaintStyle.Stroke);
    ringPaint.setStrokeWidth(1.5);
    ringPaint.setAntiAlias(true);
    ringPaint.setColor(withAlpha(accent, 0.8 * ring));
    const r = radii[focus] * (isTheme[focus] ? hubGrow : grow);
    canvas.drawCircle(sx(focus), sy(focus), r + RING_GAP + RING_GROWTH * ring, ringPaint);
  }

  if (themeFont && noteFont) {
    // Highlighted labels first, then biggest themes; a label that would overlap one already placed waits for more zoom.
    const order =
      focus >= 0
        ? [...labelOrder.filter((i) => lit[i]), ...labelOrder.filter((i) => !lit[i])]
        : labelOrder;
    const placed: number[] = [];
    for (const i of order) {
      const alpha = lit[i] ? 1 : 0.35;
      const w = labelWidths[i] + COUNT_GAP + countWidths[i];
      const x = sx(i) - w / 2;
      const y = sy(i) + radii[i] * hubGrow + THEME_LABEL_SIZE + 4;
      const top = y - THEME_LABEL_SIZE;
      let overlaps = false;
      for (let p = 0; p < placed.length && !overlaps; p += 4) {
        overlaps =
          x < placed[p + 2] + LABEL_PADDING &&
          x + w + LABEL_PADDING > placed[p] &&
          top < placed[p + 3] + LABEL_PADDING &&
          y + LABEL_PADDING > placed[p + 1];
      }
      if (overlaps) continue;
      placed.push(x, top, x + w, y);
      drawLabel(labels[i], x, y, themeFont, withAlpha(text, alpha));
      drawLabel(
        counts[i],
        x + labelWidths[i] + COUNT_GAP,
        y,
        noteFont,
        withAlpha(textMuted, alpha),
      );
    }
  }

  if (fading) canvas.restore();
}
