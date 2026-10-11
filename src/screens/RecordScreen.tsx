import { Keyboard, Pressable, Text, View } from 'react-native';
import { KeyboardAvoidingView, useKeyboardState } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Orb } from '../components/Orb/Orb';
import { Transcript } from '../components/Transcript/Transcript';
import { type Phase, useTranscriber } from '../hooks/useTranscriber';
import { styles } from './RecordScreen.styles';

// Includes the glow. The ball itself is about two thirds of this (~80pt),
// a little bigger than a camera shutter button.
const ORB_SIZE = 120;

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
// where your thumb already is. After a recording you can tap the text to fix it.
export function RecordScreen() {
  const { phase, lines, text, setText, error, level, toggle } = useTranscriber();
  const keyboardOpen = useKeyboardState((state) => state.isVisible);

  const listening = phase === 'listening' || phase === 'starting';
  const editable = phase === 'ready' && lines.length > 0;
  const status = editable ? 'tap the text to edit' : statusText[phase];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.screen} behavior="padding">
        <Transcript
          lines={lines}
          listening={listening}
          editable={editable}
          text={text}
          onChangeText={setText}
        />

        {keyboardOpen ? (
          // While typing, the orb steps aside so the text has room.
          <View style={styles.editingBar}>
            <Pressable
              onPress={Keyboard.dismiss}
              accessibilityRole="button"
              style={styles.doneButton}
              hitSlop={12}
            >
              <Text style={styles.doneText}>done</Text>
            </Pressable>
          </View>
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
  );
}
