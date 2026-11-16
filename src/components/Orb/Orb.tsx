import { Canvas, Fill, Shader } from '@shopify/react-native-skia';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { GestureResponderEvent, Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { haptics } from '../../features/appearance/haptics';
import type { Phase } from '../../hooks/useTranscriber';
import { orbShader } from './shader';
import { useOrbUniforms } from './useOrbUniforms';

type OrbProps = {
  phase: Phase;
  level: SharedValue<number>;
  size: number;
  onPress: () => void;
};

const accessibilityLabels: Record<Phase, string> = {
  loading: 'Loading speech model',
  ready: 'Start listening',
  starting: 'Starting',
  listening: 'Stop listening',
  stopping: 'Finishing transcription',
  error: 'Speech model unavailable',
};

const pressTiming = { duration: 150, easing: Easing.out(Easing.quad) };

// Look lives in shader.ts, animation in useOrbUniforms.ts; this just handles touches.
export function Orb({ phase, level, size, onPress }: OrbProps) {
  const reduceMotion = useReducedMotion();
  const { uniforms, tiltTowards, resetTilt } = useOrbUniforms(phase, level, size);

  // Shrinks slightly while pressed so the tap feels physical.
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const listening = phase === 'listening' || phase === 'starting';
  const busy = phase === 'loading' || phase === 'stopping';
  const disabled = busy || phase === 'error';

  function handleTouch(event: GestureResponderEvent) {
    tiltTowards(event.nativeEvent.locationX, event.nativeEvent.locationY);
  }

  function handlePressIn(event: GestureResponderEvent) {
    handleTouch(event);
    if (!reduceMotion) scale.value = withTiming(0.96, pressTiming);
  }

  function handlePressOut() {
    scale.value = withTiming(1, pressTiming);
    resetTilt();
  }

  function handlePress() {
    haptics.impact(listening ? ImpactFeedbackStyle.Light : ImpactFeedbackStyle.Medium);
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabels[phase]}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      hitSlop={8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View
        style={[{ width: size, height: size }, animatedStyle]}
        onTouchMove={handleTouch}
      >
        {/* pointerEvents="none" so the canvas doesn't swallow the press. */}
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <Fill>
            <Shader source={orbShader} uniforms={uniforms} />
          </Fill>
        </Canvas>
      </Animated.View>
    </Pressable>
  );
}
