import { Text, View } from 'react-native';
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
// where your thumb already is.
export function RecordScreen() {
  const { phase, lines, error, level, toggle } = useTranscriber();
  const listening = phase === 'listening' || phase === 'starting';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Transcript lines={lines} listening={listening} />
      <View style={styles.controls}>
        <Orb phase={phase} level={level} size={ORB_SIZE} onPress={toggle} />
        <Text
          style={[styles.status, error && styles.error]}
          accessibilityRole={error ? 'alert' : undefined}
          numberOfLines={3}
        >
          {error ?? statusText[phase]}
        </Text>
      </View>
    </SafeAreaView>
  );
}
