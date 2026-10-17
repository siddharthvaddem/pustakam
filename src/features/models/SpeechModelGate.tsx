import * as Haptics from 'expo-haptics';
import { createContext, type ReactNode, useContext, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SetupScreen } from '../../screens/SetupScreen';
import { SPEECH_EN } from './packs';
import { useModelPack } from './useModelPack';

const SpeechModelPath = createContext<string | null>(null);

/** Folder holding the speech model files. Only available inside SpeechModelGate. */
export function useSpeechModelPath(): string {
  const path = useContext(SpeechModelPath);
  if (!path) throw new Error('useSpeechModelPath must be used inside SpeechModelGate');
  return path;
}

// Shows the first-launch screen until the speech model is on the phone, then the app.
// After the first launch this is a quick check that finds the files already there.
export function SpeechModelGate({ children }: { children: ReactNode }) {
  const { state, start, cancel } = useModelPack(SPEECH_EN);

  // Remember a download happened this session, so only then the app fades in.
  const downloaded = useRef(false);
  if (state.status === 'downloading') downloaded.current = true;

  useEffect(() => {
    if (state.status === 'ready' && downloaded.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [state.status]);

  if (state.status === 'checking') return null;
  if (state.status !== 'ready') {
    return <SetupScreen state={state} onStart={start} onCancel={cancel} />;
  }

  return (
    <SpeechModelPath.Provider value={state.path}>
      <Animated.View
        style={styles.fill}
        entering={downloaded.current ? FadeIn.duration(400) : undefined}
      >
        {children}
      </Animated.View>
    </SpeechModelPath.Provider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
