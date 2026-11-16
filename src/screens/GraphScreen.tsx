import { ArrowsInIcon, ListIcon, XIcon } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarSpace } from '../components/GlassTabBar/GlassTabBar';
import { NoteGraphView, type NoteGraphViewHandle } from '../components/NoteGraphView/NoteGraphView';
import { NoteResult } from '../components/NoteResult/NoteResult';
import { ThemeCard } from '../components/ThemeCard/ThemeCard';
import { TopBar } from '../components/TopBar/TopBar';
import {
  type GraphSelection,
  type NoteGraph,
  type NoteNode,
  nodeId,
  toSearchResult,
} from '../features/graph/graph';
import { useGraphHint } from '../features/graph/useGraphHint';
import { useNoteGraph } from '../features/graph/useNoteGraph';
import { useOpenDrawer } from '../navigation/useOpenDrawer';
import { useTheme } from '../theme';
import { useStyles } from './GraphScreen.styles';

export function GraphScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const openDrawer = useOpenDrawer();
  const graph = useNoteGraph();
  const tabBarSpace = useTabBarSpace();
  const reduceMotion = useReducedMotion();
  const graphView = useRef<NoteGraphViewHandle>(null);
  const [selection, setSelection] = useState<GraphSelection>(null);
  const hasThemes = graph?.nodes.some((node) => node.kind === 'theme') ?? false;
  const hint = useGraphHint(hasThemes);
  const fade = {
    entering: reduceMotion ? undefined : FadeIn.duration(200),
    exiting: reduceMotion ? undefined : FadeOut.duration(150),
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar
        icon={ListIcon}
        accessibilityLabel="Open menu"
        onPress={openDrawer}
        title="Graph"
        action={
          hasThemes
            ? {
                icon: ArrowsInIcon,
                accessibilityLabel: 'Fit graph',
                onPress: () => {
                  graphView.current?.fitAll();
                  setSelection(null);
                },
              }
            : undefined
        }
      />
      {graph === null ? (
        <FindingThemes />
      ) : !hasThemes ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>no connections yet</Text>
          <Text style={styles.emptyHint}>notes that share a meaning will link up here</Text>
        </View>
      ) : (
        <View style={styles.graph}>
          <NoteGraphView
            ref={graphView}
            graph={graph}
            selection={selection}
            onSelect={setSelection}
            onInteract={hint.interact}
            bottomInset={tabBarSpace}
          />
          {hint.show ? (
            <Animated.View style={styles.hint} pointerEvents="none" {...fade}>
              <Text style={styles.hintText}>pinch or double-tap to zoom · tap a theme</Text>
            </Animated.View>
          ) : null}
          {selection ? (
            <Animated.View
              key={nodeId(selection)}
              style={[styles.card, { bottom: tabBarSpace }]}
              {...fade}
            >
              <SelectionCard graph={graph} selection={selection} />
              <Pressable
                onPress={() => setSelection(null)}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={8}
                style={({ pressed }) => [styles.close, pressed && styles.pressed]}
              >
                <XIcon size={16} color={colors.textMuted} />
              </Pressable>
            </Animated.View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}

function FindingThemes() {
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (!reduceMotion) opacity.value = withRepeat(withTiming(0.4, { duration: 900 }), -1, true);
  }, [reduceMotion, opacity]);
  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.center}>
      <Animated.Text style={[styles.emptyHint, pulse]}>finding themes…</Animated.Text>
    </View>
  );
}

function SelectionCard({
  graph,
  selection,
}: {
  graph: NoteGraph;
  selection: NonNullable<GraphSelection>;
}) {
  const notes = graph.nodes.filter((node): node is NoteNode => node.kind === 'note');
  if (selection.kind === 'note') {
    const note = notes.find((node) => node.id === selection.id);
    return note ? <NoteResult result={toSearchResult(note)} /> : null;
  }

  const theme = graph.nodes.find((node) => node.kind === 'theme' && node.key === selection.key);
  if (!theme || theme.kind !== 'theme') return null;
  const ids = new Set(graph.links.filter((link) => link.theme === theme.key).map((l) => l.note));
  const themed = notes.filter((note) => ids.has(note.id)).sort((a, b) => b.startedAt - a.startedAt);
  return <ThemeCard label={theme.label} notes={themed} />;
}
