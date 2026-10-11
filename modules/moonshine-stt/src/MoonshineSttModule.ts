import { NativeModule, requireNativeModule } from 'expo';
import type { MoonshineSttEvents } from './MoonshineStt.types';

// The TypeScript side of the native module. The actual work happens in
// ios/MoonshineSttModule.swift and android/.../MoonshineSttModule.kt.
declare class MoonshineSttModule extends NativeModule<MoonshineSttEvents> {
  /** Loads the speech model and gets the mic ready. Safe to call more than once. */
  load(): Promise<void>;
  /** Starts recording. Fails with code `E_MIC_DENIED` if mic access was refused. */
  start(): Promise<void>;
  /** Stops recording. Resolves after the last line of text has been sent. */
  stop(): Promise<void>;
}

export default requireNativeModule<MoonshineSttModule>('MoonshineStt');
