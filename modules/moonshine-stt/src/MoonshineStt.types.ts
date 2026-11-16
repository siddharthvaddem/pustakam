export type LineEvent = {
  /** String because native ids are 64-bit. */
  id: string;
  text: string;
  isComplete: boolean;
};

/** RMS of the latest mic buffer, roughly 0..0.3 for speech. */
export type LevelEvent = { level: number };

export type ErrorEvent = { message: string };

export type MoonshineSttEvents = {
  onLine(event: LineEvent): void;
  onLevel(event: LevelEvent): void;
  onError(event: ErrorEvent): void;
};
