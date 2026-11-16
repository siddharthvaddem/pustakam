import { NativeModule, requireNativeModule } from 'expo';
import type { MoonshineSttEvents } from './MoonshineStt.types';

declare class MoonshineSttModule extends NativeModule<MoonshineSttEvents> {
  /** Also gets the mic ready. Safe to call more than once. */
  load(modelPath: string): Promise<void>;
  /** Rejects with `E_MIC_DENIED` if mic access was refused. */
  start(): Promise<void>;
  /** Resolves after the last line is sent. */
  stop(): Promise<void>;
  /** Spelled as they should appear. No commas. */
  setKeyterms(terms: string[]): Promise<void>;
  /** Default 4. Reloads the model after any current recording. */
  setKeytermBoost(boost: number): Promise<void>;
}

export default requireNativeModule<MoonshineSttModule>('MoonshineStt');
