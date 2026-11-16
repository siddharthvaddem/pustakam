import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useKeyboardState } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../../theme';
import { PILL_HEIGHT, SEGMENT_WIDTH, useStyles } from './GlassTabBar.styles';

// How much room screens leave at the bottom so content clears the pill.
export function useTabBarSpace(): number {
  const insets = useSafeAreaInsets();
  return pillBottom(insets.bottom) + PILL_HEIGHT + 28;
}

function pillBottom(safeBottom: number): number {
  return Math.max(safeBottom, 16);
}

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const styles = useStyles();
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardState((k) => k.isVisible);

  const x = useSharedValue(state.index * SEGMENT_WIDTH);
  useEffect(() => {
    x.value = withSpring(state.index * SEGMENT_WIDTH, { damping: 20, stiffness: 240 });
  }, [state.index, x]);
  const glowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  if (keyboardVisible) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: pillBottom(insets.bottom) }]}
      accessibilityRole="tablist"
    >
      <View style={[styles.shadow, { shadowOpacity: scheme === 'dark' ? 0.35 : 0.12 }]}>
        <BlurView intensity={40} tint={scheme} style={styles.pill}>
          <View style={styles.tint} />
          <Animated.View style={[styles.glow, glowStyle]}>
            <Svg width="100%" height="100%">
              <Defs>
                <RadialGradient id="glow" cx="50%" cy="50%" rx="60%" ry="90%">
                  <Stop offset="0" stopColor={colors.accent} stopOpacity={0.38} />
                  <Stop offset="1" stopColor={colors.accent} stopOpacity={0.06} />
                </RadialGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#glow)" />
            </Svg>
          </Animated.View>

          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const { options } = descriptors[route.key];
            const title = (options.title ?? route.name).toLowerCase();
            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={options.title}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
                }}
                style={styles.segment}
              >
                <Text style={[styles.label, focused && { color: colors.accent }]}>{title}</Text>
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}
