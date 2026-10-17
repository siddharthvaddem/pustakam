import { NativeModule, requireNativeModule } from 'expo';

export type PackFile = {
  name: string;
  url: string;
  /** Lowercase hex SHA-256 of the file. */
  sha256: string;
  /** Size in bytes, used for progress before the server answers. */
  size: number;
};

export type PackStatus = {
  installed: boolean;
  /** Folder the pack's files live in, whether or not they're there yet. */
  path: string;
};

export type ProgressEvent = { packId: string; bytesDone: number; bytesTotal: number };

export type ModelStoreEvents = {
  onProgress(event: ProgressEvent): void;
};

// Error codes `download` can reject with.
export type DownloadErrorCode = 'E_NETWORK' | 'E_CHECKSUM' | 'E_STORAGE' | 'E_CANCELLED';

// Keeps model files on the device. Packs are folders of files, downloaded once and
// checked against their SHA-256. The actual work happens in ios/ModelStoreModule.swift
// and android/.../ModelStoreModule.kt.
declare class ModelStoreModule extends NativeModule<ModelStoreEvents> {
  /** Whether a pack is fully downloaded and matches `version`. */
  getStatus(packId: string, version: string): Promise<PackStatus>;
  /**
   * Downloads whatever is missing, resuming partial files, and resolves with the
   * pack's folder. A different `version` than the one on disk starts over.
   */
  download(packId: string, version: string, files: PackFile[]): Promise<string>;
  /** Stops a running download. Partial files are kept so it can resume. */
  cancel(packId: string): Promise<void>;
  /** Free space where packs are stored, in bytes. */
  freeBytes(): Promise<number>;
}

export default requireNativeModule<ModelStoreModule>('ModelStore');
