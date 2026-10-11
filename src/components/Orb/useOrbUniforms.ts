import { Skia, useClock } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import {
  Easing,
  SharedValue,
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { Phase } from '../../hooks/useTranscriber';
import { orbColors } from '../../theme';

const tiltSpring = { damping: 14, stiffness: 120 };

// Shaders want colors as [r, g, b] in 0..1, not hex strings.
const toRgb = (hex: string) => Array.from(Skia.Color(hex).slice(0, 3));
const palette = {
  deep: toRgb(orbColors.deep),
  base: toRgb(orbColors.base),
  lit: toRgb(orbColors.lit),
  tint: toRgb(orbColors.tint),
  rim: toRgb(orbColors.rim),
  sheen: toRgb(orbColors.sheen),
  halo: toRgb(orbColors.halo),
};

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

// Turns app state (phase, mic level, touches) into the numbers the orb shader reads.
// Everything here animates on the UI thread, so React never re-renders for it.
export function useOrbUniforms(phase: Phase, level: SharedValue<number>, size: number) {
  const reduceMotion = useReducedMotion();
  const clock = useClock();

  const active = useSharedValue(0); // 0 = idle, 1 = listening
  const ready = useSharedValue(0); // 0 = model still loading
  const pulse = useSharedValue(0); // quick flash when recording starts
  const smoothLevel = useSharedValue(0);
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);

  // Ease between states instead of snapping when the phase changes.
  useEffect(() => {
    const listening = phase === 'listening' || phase === 'starting';
    const loaded = phase !== 'loading' && phase !== 'error';

    active.value = withTiming(listening ? 1 : 0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
    ready.value = withTiming(loaded ? 1 : 0, { duration: 600 });

    if (phase === 'starting' && !reduceMotion) {
      pulse.value = withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(0, { duration: 600 }),
      );
    }
  }, [phase, reduceMotion, active, ready, pulse]);

  // Raw mic level is jumpy and small (about 0..0.25 when talking).
  // Boost it, and follow it quickly going up but slowly coming down so the orb doesn't flicker.
  useFrameCallback(() => {
    const target = Math.min(1, Math.sqrt(level.value) * 2.2);
    const rate = target > smoothLevel.value ? 0.35 : 0.08;
    smoothLevel.value += (target - smoothLevel.value) * rate;
  });

  // Recomputed every frame. Names must match the `uniform`s in shader.ts.
  const uniforms = useDerivedValue(() => ({
    ...palette,
    resolution: [size, size],
    time: reduceMotion ? 0 : clock.value / 1000, // frozen time = no motion
    level: reduceMotion ? 0 : smoothLevel.value,
    active: active.value,
    pulse: pulse.value,
    ready: ready.value,
    tilt: [tiltX.value, tiltY.value],
  }));

  // Moves the highlight toward the finger. x/y are in points inside the orb.
  function tiltTowards(x: number, y: number) {
    if (reduceMotion) return;
    tiltX.value = withSpring(clamp((x / size) * 2 - 1), tiltSpring);
    tiltY.value = withSpring(clamp((y / size) * 2 - 1), tiltSpring);
  }

  function resetTilt() {
    tiltX.value = withSpring(0, tiltSpring);
    tiltY.value = withSpring(0, tiltSpring);
  }

  return { uniforms, tiltTowards, resetTilt };
}
