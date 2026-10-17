import * as Haptics from 'expo-haptics';
import { createContext, type ReactNode, useContext, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SetupScreen } from '../../screens/SetupScreen';
import { CORE_PACKS, type ModelPack } from './packs';
import { type PackPaths, useModelPacks } from './useModelPacks';

const ModelPaths = createContext<PackPaths | null>(null);

/** Folder holding a pack's files. Only available inside ModelGate. */
export function useModelPath(pack: ModelPack): string {
  const paths = useContext(ModelPaths);
  if (!paths) throw new Error('useModelPath must be used inside ModelGate');
  return paths[pack.id];
}

// Shows the first-launch screen until every core model is on the phone, then the app.
// After the first launch this is a quick check that finds the files already there.
export function ModelGate({ children }: { children: ReactNode }) {
  const { state, start, cancel } = useModelPacks(CORE_PACKS);

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
    <ModelPaths.Provider value={state.paths}>
      <Animated.View
        style={styles.fill}
        entering={downloaded.current ? FadeIn.duration(400) : undefined}
      >
        {children}
      </Animated.View>
    </ModelPaths.Provider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
