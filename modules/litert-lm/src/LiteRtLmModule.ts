import { NativeModule, requireNativeModule } from 'expo';

export type Backend = 'gpu' | 'cpu';

// Only the embedding model for now.
declare class LiteRtLmModule extends NativeModule {
  /** Replaces any model loaded before. */
  loadEmbedder(modelPath: string, backend: Backend): Promise<void>;
  /** One normalized vector per text. */
  embed(texts: string[]): Promise<number[][]>;
}

export default requireNativeModule<LiteRtLmModule>('LiteRtLm');
