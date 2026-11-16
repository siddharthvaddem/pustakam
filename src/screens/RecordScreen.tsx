import { router } from 'expo-router';
import { ListIcon, MagnifyingGlassIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, Text, View } from 'react-native';
import { KeyboardAvoidingView, useKeyboardState } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DraftCard } from '../components/DraftCard/DraftCard';
import { useTabBarSpace } from '../components/GlassTabBar/GlassTabBar';
import { KeyboardDoneButton } from '../components/KeyboardDoneButton/KeyboardDoneButton';
import { Orb } from '../components/Orb/Orb';
import { TopBar } from '../components/TopBar/TopBar';
import { Transcript } from '../components/Transcript/Transcript';
import { haptics } from '../features/appearance/haptics';
import { useSyncKeyterms } from '../features/keyterms/useSyncKeyterms';
import { addEntry } from '../features/notes/repository';
import { type Phase, useTranscriber } from '../hooks/useTranscriber';
import { useOpenDrawer } from '../navigation/useOpenDrawer';
import { useStyles } from './RecordScreen.styles';

// Includes the glow; the ball itself is ~80pt, a bit bigger than a shutter button.
const ORB_SIZE = 120;

const SAVED_MS = 2000;

// The only instructions on screen; the transcript area is for your words.
const statusText: Record<Phase, string> = {
  loading: 'waking up',
  ready: 'tap to speak',
  starting: 'listening · tap to stop',
  listening: 'listening · tap to stop',
  stopping: 'finishing',
  error: 'model failed to load',
};

export function RecordScreen() {
  const styles = useStyles();
  const { phase, lines, text, setText, startedAt, clear, error, level, toggle } = useTranscriber();
  const keyboardOpen = useKeyboardState((state) => state.isVisible);
  const openDrawer = useOpenDrawer();
  const tabBarSpace = useTabBarSpace();
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
    haptics.success();
  }

  function confirmDiscard() {
    Alert.alert('Discard this draft?', 'It won’t be saved to your notes.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: clear },
    ]);
  }

  return (
    <View style={styles.screen}>
      {/* The floating tab bar clears the home indicator, so only pad the top. */}
      <SafeAreaView style={styles.screen} edges={['top']}>
        <KeyboardAvoidingView style={styles.screen} behavior="padding">
          <TopBar
            icon={ListIcon}
            accessibilityLabel="Open menu"
            onPress={openDrawer}
            action={{
              icon: MagnifyingGlassIcon,
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
            // The orb steps aside while typing.
            <View style={styles.keyboardSpacer} />
          ) : (
            <View style={[styles.controls, { paddingBottom: tabBarSpace }]}>
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
