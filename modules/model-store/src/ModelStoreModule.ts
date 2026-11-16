import { NativeModule, requireNativeModule } from 'expo';

export type PackFile = {
  name: string;
  url: string;
  /** Lowercase hex. */
  sha256: string;
  /** Bytes; used for progress before the server answers. */
  size: number;
};

export type PackStatus = {
  installed: boolean;
  /** Pack folder, even before its files are downloaded. */
  path: string;
};

export type ProgressEvent = { packId: string; bytesDone: number; bytesTotal: number };

export type ModelStoreEvents = {
  onProgress(event: ProgressEvent): void;
};

export type DownloadErrorCode = 'E_NETWORK' | 'E_CHECKSUM' | 'E_STORAGE' | 'E_CANCELLED';

declare class ModelStoreModule extends NativeModule<ModelStoreEvents> {
  getStatus(packId: string, version: string): Promise<PackStatus>;
  /** Resumes partial files and resolves with the pack folder; a new `version` starts over. */
  download(packId: string, version: string, files: PackFile[]): Promise<string>;
  /** Partial files are kept so it can resume. */
  cancel(packId: string): Promise<void>;
  freeBytes(): Promise<number>;
}

export default requireNativeModule<ModelStoreModule>('ModelStore');
