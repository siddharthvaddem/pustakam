import { useCallback, useEffect, useRef, useState } from 'react';
import ModelStore from '../../../modules/model-store';
import { type ModelPack, packBytes } from './packs';

// Leaves some room so the phone isn't left completely full.
const SPACE_HEADROOM = 1.1;

export type PackErrorCode = 'E_NETWORK' | 'E_CHECKSUM' | 'E_STORAGE' | 'E_SPACE' | 'E_UNKNOWN';

/** Folder of each pack, by pack id. */
export type PackPaths = Record<string, string>;

export type PacksState =
  | { status: 'checking' }
  | { status: 'missing'; bytesNeeded: number }
  | { status: 'downloading'; bytesDone: number; bytesTotal: number }
  | { status: 'error'; code: PackErrorCode; bytesNeeded: number }
  | { status: 'ready'; paths: PackPaths };

function totalBytes(packs: readonly ModelPack[]): number {
  return packs.reduce((sum, pack) => sum + packBytes(pack), 0);
}

async function survey(packs: readonly ModelPack[]) {
  const paths: PackPaths = {};
  const missing: ModelPack[] = [];
  for (const pack of packs) {
    const status = await ModelStore.getStatus(pack.id, pack.version);
    paths[pack.id] = status.path;
    if (!status.installed) missing.push(pack);
  }
  return { paths, missing };
}

// Downloads the missing packs one after another, shown as one download.
export function useModelPacks(packs: readonly ModelPack[]) {
  const [state, setState] = useState<PacksState>({ status: 'checking' });
  // The pack downloading now, and the bytes of the packs finished before it.
  const current = useRef<{ packId: string; bytesBefore: number } | null>(null);

  useEffect(() => {
    let live = true;
    survey(packs)
      .then(({ paths, missing }) => {
        if (!live) return;
        setState(
          missing.length
            ? { status: 'missing', bytesNeeded: totalBytes(missing) }
            : { status: 'ready', paths },
        );
      })
      .catch(() => live && setState({ status: 'missing', bytesNeeded: totalBytes(packs) }));
    return () => {
      live = false;
    };
  }, [packs]);

  useEffect(() => {
    const subscription = ModelStore.addListener('onProgress', (event) => {
      const pack = current.current;
      if (event.packId !== pack?.packId) return;
      setState((previous) =>
        previous.status === 'downloading'
          ? { ...previous, bytesDone: pack.bytesBefore + event.bytesDone }
          : previous,
      );
    });
    return () => subscription.remove();
  }, []);

  const start = useCallback(async () => {
    const { paths, missing } = await survey(packs);
    const bytesTotal = totalBytes(missing);
    if ((await ModelStore.freeBytes()) < bytesTotal * SPACE_HEADROOM) {
      setState({ status: 'error', code: 'E_SPACE', bytesNeeded: bytesTotal });
      return;
    }

    setState({ status: 'downloading', bytesDone: 0, bytesTotal });
    let bytesBefore = 0;
    try {
      for (const pack of missing) {
        current.current = { packId: pack.id, bytesBefore };
        paths[pack.id] = await ModelStore.download(pack.id, pack.version, pack.files);
        bytesBefore += packBytes(pack);
      }
      setState({ status: 'ready', paths });
    } catch (error) {
      // Finished packs stay installed, so only the rest is still needed.
      const bytesNeeded = bytesTotal - bytesBefore;
      const code = (error as { code?: string }).code;
      if (code === 'E_CANCELLED') {
        setState({ status: 'missing', bytesNeeded });
      } else {
        const known = code === 'E_NETWORK' || code === 'E_CHECKSUM' || code === 'E_STORAGE';
        setState({ status: 'error', code: known ? code : 'E_UNKNOWN', bytesNeeded });
      }
    }
    current.current = null;
  }, [packs]);

  // Partial files are kept, so starting again later picks up where this left off.
  const cancel = useCallback(() => {
    if (current.current) ModelStore.cancel(current.current.packId);
  }, []);

  return { state, start, cancel };
}
