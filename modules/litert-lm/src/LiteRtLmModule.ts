import { NativeModule, requireNativeModule } from 'expo';

export type Backend = 'gpu' | 'cpu';

// Google's LiteRT-LM. For now only the embedding model, which turns text into vectors.
declare class LiteRtLmModule extends NativeModule {
  /** Replaces any model loaded before. */
  loadEmbedder(modelPath: string, backend: Backend): Promise<void>;
  /** One normalized vector per text. */
  embed(texts: string[]): Promise<number[][]>;
  closeEmbedder(): Promise<void>;
}

export default requireNativeModule<LiteRtLmModule>('LiteRtLm');
