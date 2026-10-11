import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardDoneButton } from '../components/KeyboardDoneButton/KeyboardDoneButton';
import { TopBar } from '../components/TopBar/TopBar';
import type { Entry } from '../db/schema';
import { dayLabel, timeLabel } from '../features/notes/dates';
import { deleteEntry, updateEntry } from '../features/notes/repository';
import { useDayEntries } from '../features/notes/useDayEntries';
import { colors } from '../theme';
import { styles } from './DayScreen.styles';

// One day's note: its entries as paragraphs, each under the time it was recorded.
// Tap a paragraph to fix it; long-press to delete it.
export function DayScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const entries = useDayEntries(day);

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
          icon="chevron-left"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          title={dayLabel(day)}
        />
        <KeyboardAwareScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          bottomOffset={72}
        >
          {entries.map((entry) => (
            <EntryParagraph key={entry.id} entry={entry} />
          ))}
        </KeyboardAwareScrollView>
      </SafeAreaView>
      <KeyboardDoneButton />
    </View>
  );
}

function EntryParagraph({ entry }: { entry: Entry }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.text);

  // Read when editing ends, which can be after this render.
  const latest = useRef({ draft, entry });
  latest.current = { draft, entry };

  // Saves when editing ends: the keyboard closes, or you leave the page mid-edit.
  // Clearing a paragraph doesn't delete it; long-press does that.
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
    <View style={styles.entry}>
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
          keyboardAppearance="dark"
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
