import { createContext, type ReactNode, useContext, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SetupScreen } from '../../screens/SetupScreen';
import { haptics } from '../appearance/haptics';
import { syncIndex } from '../search/indexer';
import { CORE_PACKS, type ModelPack } from './packs';
import { type PackPaths, useModelPacks } from './useModelPacks';

const ModelPaths = createContext<PackPaths | null>(null);

/** Only available inside ModelGate. */
export function useModelPath(pack: ModelPack): string {
  const paths = useContext(ModelPaths);
  if (!paths) throw new Error('useModelPath must be used inside ModelGate');
  return paths[pack.id];
}

export function ModelGate({ children }: { children: ReactNode }) {
  const { state, start, cancel } = useModelPacks(CORE_PACKS);

  // The app only fades in if a download happened this session.
  const downloaded = useRef(false);
  if (state.status === 'downloading') downloaded.current = true;

  useEffect(() => {
    if (state.status !== 'ready') return;
    if (downloaded.current) haptics.success();
    // Indexing needs the embedding model, which only exists from here on.
    syncIndex();
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
