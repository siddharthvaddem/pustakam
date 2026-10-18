import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, Text, View } from 'react-native';
import { KeyboardAvoidingView, useKeyboardState } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DraftCard } from '../components/DraftCard/DraftCard';
import { KeyboardDoneButton } from '../components/KeyboardDoneButton/KeyboardDoneButton';
import { Orb } from '../components/Orb/Orb';
import { TopBar } from '../components/TopBar/TopBar';
import { Transcript } from '../components/Transcript/Transcript';
import { useSyncKeyterms } from '../features/keyterms/useSyncKeyterms';
import { addEntry } from '../features/notes/repository';
import { type Phase, useTranscriber } from '../hooks/useTranscriber';
import { useOpenDrawer } from '../navigation/useOpenDrawer';
import { styles } from './RecordScreen.styles';

// Includes the glow. The ball itself is about two thirds of this (~80pt),
// a little bigger than a camera shutter button.
const ORB_SIZE = 120;

// How long "saved" stays under the orb after sending.
const SAVED_MS = 2000;

// The small label under the orb. It's the only place that tells you what to do;
// the transcript area stays for your words.
const statusText: Record<Phase, string> = {
  loading: 'waking up',
  ready: 'tap to speak',
  starting: 'listening · tap to stop',
  listening: 'listening · tap to stop',
  stopping: 'finishing',
  error: 'model failed to load',
};

// Your words fill the screen from the bottom up, and the orb sits under them
// where your thumb already is. What you say stays as a draft (you can fix it,
// or record more) until you send it to today's note.
export function RecordScreen() {
  const { phase, lines, text, setText, startedAt, clear, error, level, toggle } = useTranscriber();
  const keyboardOpen = useKeyboardState((state) => state.isVisible);
  const openDrawer = useOpenDrawer();
  const [justSaved, setJustSaved] = useState(false);
  useSyncKeyterms();

  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), SAVED_MS);
    return () => clearTimeout(timer);
  }, [justSaved]);

  const listening = phase === 'listening' || phase === 'starting';
  const hasDraft = startedAt !== null;
  const editable = phase === 'ready' && hasDraft;

  let status = statusText[phase];
  if (editable) status = 'tap the text to edit';
  else if (justSaved && phase === 'ready') status = 'saved';

  async function send() {
    if (!startedAt || !text.trim()) return;
    Keyboard.dismiss();
    await addEntry({ text, startedAt });
    clear();
    setJustSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  // Asks first, so a draft is never lost to a stray tap.
  function confirmDiscard() {
    Alert.alert('Discard this draft?', 'It won’t be saved to your notes.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: clear },
    ]);
  }

  return (
    <View style={styles.screen}>
      {/* The tab bar already keeps clear of the home indicator, so only the top needs padding. */}
      <SafeAreaView style={styles.screen} edges={['top']}>
        <KeyboardAvoidingView style={styles.screen} behavior="padding">
          <TopBar
            icon="menu"
            accessibilityLabel="Open menu"
            onPress={openDrawer}
            action={{
              icon: 'search',
              accessibilityLabel: 'Search notes',
              onPress: () => router.push('/search'),
            }}
          />
          {editable ? (
            <DraftCard
              text={text}
              onChangeText={setText}
              onSend={send}
              onDiscard={confirmDiscard}
              showActions={!keyboardOpen}
            />
          ) : (
            <Transcript lines={lines} listening={listening} text={text} />
          )}

          {keyboardOpen ? (
            // While typing, the orb steps aside to make room for the text.
            <View style={styles.keyboardSpacer} />
          ) : (
            <View style={styles.controls}>
              <Orb phase={phase} level={level} size={ORB_SIZE} onPress={toggle} />
              <Text
                style={[styles.status, error && styles.error]}
                accessibilityRole={error ? 'alert' : undefined}
                numberOfLines={3}
              >
                {error ?? status}
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      <KeyboardDoneButton />
    </View>
  );
}
