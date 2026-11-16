import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useStyles } from './Caret.styles';

// Stays solid with Reduce Motion on.
export function Caret() {
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    const blink = withSequence(
      withTiming(1, { duration: 500 }),
      withTiming(0.15, { duration: 500 }),
    );
    opacity.value = withRepeat(blink, -1);
  }, [reduceMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.caret, animatedStyle]} />;
}
