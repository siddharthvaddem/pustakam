import { router, useLocalSearchParams } from 'expo-router';
import { CaretLeftIcon } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, type ScrollView, Text, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardDoneButton } from '../components/KeyboardDoneButton/KeyboardDoneButton';
import { NoteResult } from '../components/NoteResult/NoteResult';
import { TopBar } from '../components/TopBar/TopBar';
import type { Entry } from '../db/schema';
import { dayLabel, timeLabel } from '../features/notes/dates';
import { deleteEntry, updateEntry } from '../features/notes/repository';
import { useDayEntries } from '../features/notes/useDayEntries';
import { useRelatedMoments } from '../features/search/useSearch';
import { useTheme } from '../theme';
import { useStyles } from './DayScreen.styles';

// `entry` (from search) is highlighted.
export function DayScreen() {
  const styles = useStyles();
  const { day, entry } = useLocalSearchParams<{ day: string; entry?: string }>();
  const entries = useDayEntries(day);
  const related = useRelatedMoments(day, entries);
  const scroll = useRef<ScrollView>(null);
  // Once, not on every re-layout while editing.
  const scrolled = useRef(false);
  function scrollTo(y: number) {
    if (scrolled.current) return;
    scrolled.current = true;
    scroll.current?.scrollTo({ y: Math.max(0, y - 16) });
  }

  // Deleting a day's last entry removes the day, so head back to the list.
  const hadEntries = useRef(false);
  useEffect(() => {
    if (entries.length > 0) hadEntries.current = true;
    else if (hadEntries.current) router.back();
  }, [entries.length]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <TopBar
          icon={CaretLeftIcon}
          accessibilityLabel="Back"
          onPress={() => router.back()}
          title={dayLabel(day)}
        />
        <KeyboardAwareScrollView
          ref={scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          bottomOffset={72}
        >
          {entries.map((item) => (
            <EntryParagraph
              key={item.id}
              entry={item}
              highlighted={String(item.id) === entry}
              onScrollTo={scrollTo}
            />
          ))}

          {related.length > 0 && (
            <View style={styles.related}>
              <Text style={styles.relatedLabel}>related moments</Text>
              {related.map((result) => (
                <NoteResult key={result.id} result={result} />
              ))}
            </View>
          )}
        </KeyboardAwareScrollView>
      </SafeAreaView>
      <KeyboardDoneButton />
    </View>
  );
}

type EntryParagraphProps = {
  entry: Entry;
  highlighted: boolean;
  onScrollTo: (y: number) => void;
};

function EntryParagraph({ entry, highlighted, onScrollTo }: EntryParagraphProps) {
  const styles = useStyles();
  const { scheme, colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const glow = useSharedValue(highlighted ? 1 : 0);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  useEffect(() => {
    if (highlighted) glow.value = withDelay(1200, withTiming(0, { duration: 800 }));
  }, [highlighted, glow]);
  const [draft, setDraft] = useState(entry.text);

  // Read when editing ends, which can be after this render.
  const latest = useRef({ draft, entry });
  latest.current = { draft, entry };

  // Saves when editing ends. Clearing a paragraph doesn't delete it; long-press does.
  useEffect(() => {
    if (!editing) return;
    return () => {
      const text = latest.current.draft.trim();
      const { id, text: saved } = latest.current.entry;
      if (text && text !== saved) updateEntry(id, text);
    };
  }, [editing]);

  function confirmDelete() {
    Alert.alert('Delete this entry?', 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(entry.id) },
    ]);
  }

  return (
    <View
      style={styles.entry}
      onLayout={(event) => highlighted && onScrollTo(event.nativeEvent.layout.y)}
    >
      <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none" />
      <Text style={styles.time}>{timeLabel(entry.startedAt)}</Text>
      {editing ? (
        <TextInput
          style={styles.editor}
          value={draft}
          onChangeText={setDraft}
          onBlur={() => setEditing(false)}
          autoFocus
          multiline
          scrollEnabled={false}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          keyboardAppearance={scheme}
          accessibilityLabel={`Entry at ${timeLabel(entry.startedAt)}, editable`}
        />
      ) : (
        <Pressable
          onPress={() => {
            setDraft(entry.text);
            setEditing(true);
          }}
          onLongPress={confirmDelete}
          accessibilityRole="button"
          accessibilityHint="Tap to edit, hold to delete"
        >
          <Text style={styles.text}>{entry.text}</Text>
        </Pressable>
      )}
    </View>
  );
}
