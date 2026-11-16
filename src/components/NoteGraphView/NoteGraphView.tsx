import { Canvas, createPicture, Picture, useFont } from '@shopify/react-native-skia';
import { type Ref, useCallback, useEffect, useImperativeHandle, useMemo } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  cancelAnimation,
  Easing,
  useAnimatedReaction,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDecay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';
import { haptics } from '../../features/appearance/haptics';
import {
  type GraphSelection,
  type NoteGraph,
  nodeId,
  noteNodeId,
  themeNodeId,
} from '../../features/graph/graph';
import { useForceLayout } from '../../features/graph/useForceLayout';
import { useTheme } from '../../theme';
import { boundsOf, type Camera, clamp, fitBounds, MAX_SCALE, MIN_SCALE, panLimits } from './camera';
import { drawGraph, NOTE_LABEL_SIZE, nodeScale, type Scene, THEME_LABEL_SIZE } from './drawGraph';
import { useStyles } from './NoteGraphView.styles';

const TOUCH_RADIUS = 22;
const NOTE_RADIUS = 3.5;
const LABEL_WORDS = 3;
const MAX_FIT_SCALE = 1.5;
const MAX_FOCUS_SCALE = 2.2;
const DOUBLE_TAP_ZOOM = 2;
// Zoom relative to the whole-graph view past which a double-tap zooms back out.
const ZOOMED_IN = 2.5;
const DOUBLE_TAP_DELAY_MS = 300;
const ZOOM_MS = 300;
const FOCUS_MS = 350;
const APPEAR_MS = 500;
const RING_MS = 400;
// Room the selection card takes above the tab bar; the theme card is capped at 40% of the canvas.
const THEME_CARD_SHARE = 0.4;
const NOTE_CARD_SPACE = 130;
// Note labels hang off the right of their dot, so a framed selection leaves room for them.
const NOTE_LABEL_ROOM = 100;

function themeRadius(count: number): number {
  return 8 + Math.sqrt(count) * 3;
}

function firstWords(text: string): string {
  const words = text.split(/\s+/).filter(Boolean);
  const head = words.slice(0, LABEL_WORDS).join(' ');
  return words.length > LABEL_WORDS ? `${head}…` : head;
}

// Index of the node whose edge is nearest world point (x, y) within touch reach, or -1.
function nearest(points: number[], radii: number[], x: number, y: number, scale: number): number {
  'worklet';
  const grow = nodeScale(scale) / scale;
  let best = -1;
  let bestGap = TOUCH_RADIUS / scale;
  for (let i = 0; i < points.length; i += 2) {
    const gap = Math.hypot(points[i] - x, points[i + 1] - y) - radii[i / 2] * grow;
    if (gap < bestGap) {
      best = i / 2;
      bestGap = gap;
    }
  }
  return best;
}

export type NoteGraphViewHandle = { fitAll: () => void };

type NoteGraphViewProps = {
  graph: NoteGraph;
  selection: GraphSelection;
  onSelect: (selection: GraphSelection) => void;
  // Called at the start of every gesture.
  onInteract: () => void;
  // Height covered by overlays at the bottom, left out when framing the graph.
  bottomInset: number;
  ref?: Ref<NoteGraphViewHandle>;
};

export function NoteGraphView({
  graph,
  selection,
  onSelect,
  onInteract,
  bottomInset,
  ref,
}: NoteGraphViewProps) {
  const styles = useStyles();
  const { colors, orb, scheme } = useTheme();
  const themeFont = useFont(
    require('@expo-google-fonts/jetbrains-mono/500Medium/JetBrainsMono_500Medium.ttf'),
    THEME_LABEL_SIZE,
  );
  const noteFont = useFont(
    require('@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf'),
    NOTE_LABEL_SIZE,
  );
  const reduceMotion = useReducedMotion();
  const { positions, drag, release } = useForceLayout(graph);

  const structure = useMemo(() => {
    const indexById = new Map(graph.nodes.map((node, index) => [nodeId(node), index]));
    const neighbors: number[][] = graph.nodes.map(() => []);
    const linkEnds: number[] = [];
    for (const link of graph.links) {
      const note = indexById.get(noteNodeId(link.note))!;
      const theme = indexById.get(themeNodeId(link.theme))!;
      linkEnds.push(note, theme);
      neighbors[note].push(theme);
      neighbors[theme].push(note);
    }
    return {
      isTheme: graph.nodes.map((node) => node.kind === 'theme'),
      radii: graph.nodes.map((node) =>
        node.kind === 'theme' ? themeRadius(node.count) : NOTE_RADIUS,
      ),
      labels: graph.nodes.map((node) =>
        node.kind === 'theme' ? node.label : firstWords(node.preview),
      ),
      counts: graph.nodes.map((node) => (node.kind === 'theme' ? String(node.count) : '')),
      labelOrder: graph.nodes
        .flatMap((node, index) => (node.kind === 'theme' ? [{ index, count: node.count }] : []))
        .sort((a, b) => b.count - a.count)
        .map(({ index }) => index),
      linkEnds,
      neighbors,
    };
  }, [graph]);

  const scene: Scene = useMemo(() => {
    const dark = scheme === 'dark';
    return {
      ...structure,
      labelWidths: structure.labels.map((label, i) =>
        structure.isTheme[i] && themeFont ? themeFont.measureText(label).width : 0,
      ),
      countWidths: structure.counts.map((label) =>
        label && noteFont ? noteFont.measureText(label).width : 0,
      ),
      colors: {
        accent: colors.accent,
        background: colors.background,
        text: colors.text,
        textMuted: colors.textMuted,
      },
      sphere: dark ? [orb.lit, orb.base, orb.deep] : [orb.rim, orb.lit, orb.base],
      starAlpha: dark ? 0.15 : 0.1,
      themeFont,
      noteFont,
    };
  }, [structure, themeFont, noteFont, colors, orb, scheme]);
  const { isTheme, radii, neighbors } = structure;
  const themeCount = isTheme.filter(Boolean).length;

  const size = useSharedValue({ width: 0, height: 0 });
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const selected = useSharedValue(-1);
  const dragging = useSharedValue(-1);
  const appear = useSharedValue(0);
  const ring = useSharedValue(0);
  // Scale that fits the whole graph; zoom levels are relative to it.
  const homeScale = useSharedValue(1);
  // Where the camera was before something got selected, to return to on clear.
  const beforeSelection = useSharedValue<Camera | null>(null);

  useEffect(() => {
    const id = selection && nodeId(selection);
    selected.value = graph.nodes.findIndex((node) => nodeId(node) === id);
  }, [graph, selection, selected]);

  const moveCamera = (target: Camera, duration: number) => {
    'worklet';
    if (reduceMotion) {
      translateX.value = target.x;
      translateY.value = target.y;
      scale.value = target.scale;
      return;
    }
    const timing = { duration, easing: Easing.out(Easing.cubic) };
    translateX.value = withTiming(target.x, timing);
    translateY.value = withTiming(target.y, timing);
    scale.value = withTiming(target.scale, timing);
  };

  const showWholeGraph = (duration: number) => {
    'worklet';
    const { width, height } = size.value;
    const target = fitBounds(
      boundsOf(positions.value),
      { width, height: height - bottomInset },
      MAX_FIT_SCALE,
    );
    homeScale.value = target.scale;
    moveCamera(target, duration);
  };

  const stopCamera = () => {
    'worklet';
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    cancelAnimation(scale);
  };

  useImperativeHandle(ref, () => ({
    fitAll: () =>
      scheduleOnUI(() => {
        'worklet';
        beforeSelection.value = null;
        showWholeGraph(FOCUS_MS);
      }),
  }));

  // Frames the first layout once both it and the canvas size are known, then fades it in.
  useAnimatedReaction(
    () => positions.value.length > 0 && size.value.width > 0,
    (ready, wasReady) => {
      if (!ready || wasReady) return;
      showWholeGraph(0);
      appear.value = reduceMotion ? 1 : withTiming(1, { duration: APPEAR_MS });
    },
  );

  useAnimatedReaction(
    () => selected.value,
    (index, previous) => {
      if (index === previous) return;
      if (index < 0) {
        const back = beforeSelection.value;
        beforeSelection.value = null;
        if (back) moveCamera(back, FOCUS_MS);
        return;
      }
      if (!beforeSelection.value) {
        beforeSelection.value = { x: translateX.value, y: translateY.value, scale: scale.value };
      }
      const { width, height } = size.value;
      const cardSpace = isTheme[index] ? height * THEME_CARD_SHARE : NOTE_CARD_SPACE;
      const area = { width: width - NOTE_LABEL_ROOM, height: height - bottomInset - cardSpace };
      const members = boundsOf(positions.value, [index, ...neighbors[index]]);
      moveCamera(fitBounds(members, area, MAX_FOCUS_SCALE), FOCUS_MS);
      ring.value = 0;
      ring.value = reduceMotion ? 1 : withTiming(1, { duration: RING_MS });
    },
  );

  const select = useCallback(
    (index: number) => {
      const node = graph.nodes[index];
      if (!node) {
        onSelect(null);
        return;
      }
      haptics.select();
      onSelect(
        node.kind === 'theme' ? { kind: 'theme', key: node.key } : { kind: 'note', id: node.id },
      );
    },
    [graph, onSelect],
  );

  const grab = useCallback(() => haptics.impact(), []);

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onBegin(() => {
      stopCamera();
    })
    .onStart((event) => {
      scheduleOnRN(onInteract);
      const s = scale.value;
      dragging.value = nearest(
        positions.value,
        radii,
        (event.x - event.translationX - translateX.value) / s,
        (event.y - event.translationY - translateY.value) / s,
        s,
      );
      if (dragging.value >= 0) scheduleOnRN(grab);
    })
    .onChange((event) => {
      if (dragging.value < 0) {
        translateX.value += event.changeX;
        translateY.value += event.changeY;
        return;
      }
      const s = scale.value;
      scheduleOnRN(
        drag,
        dragging.value,
        (event.x - translateX.value) / s,
        (event.y - translateY.value) / s,
      );
    })
    .onEnd((event) => {
      if (dragging.value >= 0 || reduceMotion) return;
      const camera = { x: translateX.value, y: translateY.value, scale: scale.value };
      const { width, height } = size.value;
      const limits = panLimits(boundsOf(positions.value), camera, width, height);
      translateX.value = withDecay({ velocity: event.velocityX, clamp: limits.x });
      translateY.value = withDecay({ velocity: event.velocityY, clamp: limits.y });
    })
    .onFinalize(() => {
      if (dragging.value >= 0) scheduleOnRN(release, dragging.value);
      dragging.value = -1;
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      scheduleOnRN(onInteract);
    })
    .onChange((event) => {
      const next = clamp(scale.value * event.scaleChange, MIN_SCALE, MAX_SCALE);
      const factor = next / scale.value;
      translateX.value = event.focalX - (event.focalX - translateX.value) * factor;
      translateY.value = event.focalY - (event.focalY - translateY.value) * factor;
      scale.value = next;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(DOUBLE_TAP_DELAY_MS)
    .onEnd((event) => {
      scheduleOnRN(onInteract);
      const s = scale.value;
      if (s / homeScale.value > ZOOMED_IN) {
        showWholeGraph(ZOOM_MS);
        return;
      }
      const next = clamp(s * DOUBLE_TAP_ZOOM, MIN_SCALE, MAX_SCALE);
      const factor = next / s;
      moveCamera(
        {
          x: event.x - (event.x - translateX.value) * factor,
          y: event.y - (event.y - translateY.value) * factor,
          scale: next,
        },
        ZOOM_MS,
      );
    });

  const tap = Gesture.Tap().onEnd((event) => {
    scheduleOnRN(onInteract);
    const s = scale.value;
    const index = nearest(
      positions.value,
      radii,
      (event.x - translateX.value) / s,
      (event.y - translateY.value) / s,
      s,
    );
    scheduleOnRN(select, index);
  });

  const gesture = Gesture.Exclusive(Gesture.Simultaneous(pan, pinch), doubleTap, tap);

  const picture = useDerivedValue(() =>
    createPicture((canvas) =>
      drawGraph(canvas, scene, {
        points: positions.value,
        camera: { x: translateX.value, y: translateY.value, scale: scale.value },
        width: size.value.width,
        height: size.value.height,
        focus: selected.value,
        zoom: scale.value / homeScale.value,
        appear: appear.value,
        ring: ring.value,
      }),
    ),
  );

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={styles.fill}
        accessible
        accessibilityLabel={`Graph of ${themeCount} themes and ${graph.nodes.length - themeCount} notes`}
      >
        <Canvas style={styles.fill} onSize={size}>
          <Picture picture={picture} />
        </Canvas>
      </View>
    </GestureDetector>
  );
}
