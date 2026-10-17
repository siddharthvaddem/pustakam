import { useCallback, useEffect, useState } from 'react';
import ModelStore from '../../../modules/model-store';
import { type ModelPack, packBytes } from './packs';

// Leaves some room so the phone isn't left completely full.
const SPACE_HEADROOM = 1.1;

export type PackErrorCode = 'E_NETWORK' | 'E_CHECKSUM' | 'E_STORAGE' | 'E_SPACE' | 'E_UNKNOWN';

export type PackState =
  | { status: 'checking' }
  | { status: 'missing' }
  | { status: 'downloading'; bytesDone: number; bytesTotal: number }
  | { status: 'error'; code: PackErrorCode }
  | { status: 'ready'; path: string };

// Whether a model pack is on the phone, and the download that gets it there.
export function useModelPack(pack: ModelPack) {
  const [state, setState] = useState<PackState>({ status: 'checking' });

  useEffect(() => {
    let current = true;
    ModelStore.getStatus(pack.id, pack.version)
      .then((status) => {
        if (!current) return;
        setState(status.installed ? { status: 'ready', path: status.path } : { status: 'missing' });
      })
      .catch(() => current && setState({ status: 'missing' }));
    return () => {
      current = false;
    };
  }, [pack]);

  useEffect(() => {
    const subscription = ModelStore.addListener('onProgress', (event) => {
      if (event.packId !== pack.id) return;
      setState((previous) =>
        previous.status === 'downloading'
          ? { status: 'downloading', bytesDone: event.bytesDone, bytesTotal: event.bytesTotal }
          : previous,
      );
    });
    return () => subscription.remove();
  }, [pack.id]);

  const start = useCallback(async () => {
    const total = packBytes(pack);
    if ((await ModelStore.freeBytes()) < total * SPACE_HEADROOM) {
      setState({ status: 'error', code: 'E_SPACE' });
      return;
    }

    setState({ status: 'downloading', bytesDone: 0, bytesTotal: total });
    try {
      const path = await ModelStore.download(pack.id, pack.version, pack.files);
      setState({ status: 'ready', path });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'E_CANCELLED') {
        setState({ status: 'missing' });
      } else {
        const known = code === 'E_NETWORK' || code === 'E_CHECKSUM' || code === 'E_STORAGE';
        setState({ status: 'error', code: known ? code : 'E_UNKNOWN' });
      }
    }
  }, [pack]);

  // Partial files are kept, so starting again later picks up where this left off.
  const cancel = useCallback(() => ModelStore.cancel(pack.id), [pack.id]);

  return { state, start, cancel };
}
