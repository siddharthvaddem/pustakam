import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import MoonshineStt, { type LineEvent } from '../../modules/moonshine-stt';

// loading -> ready -> starting -> listening -> stopping -> ready ...
// `error` only happens if the model fails to load.
export type Phase = 'loading' | 'ready' | 'starting' | 'listening' | 'stopping' | 'error';
export type Line = LineEvent;

const MIC_DENIED_MESSAGE = 'Microphone access is off. Turn it on in Settings to transcribe.';

// Moonshine keeps re-sending the line you're speaking as it corrects itself,
// always with the same id. So: replace the line if we have it, add it if we don't.
function upsertLine(lines: Line[], line: Line): Line[] {
  const index = lines.findIndex((existing) => existing.id === line.id);
  if (index === -1) {
    return line.text ? [...lines, line] : lines;
  }
  const next = [...lines];
  next[index] = line;
  return next;
}

// Android needs us to ask for the mic up front. On iOS the native start() asks.
async function requestMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

// The only place the app talks to the native speech module.
export function useTranscriber() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [lines, setLines] = useState<Line[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Mic volume arrives many times a second. A shared value lets the orb animate
  // from it without re-rendering the whole screen each time.
  const level = useSharedValue(0);

  // `toggle` is created once, so it reads the phase through a ref to always see the latest.
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Listen to the native module and load the model when the screen mounts.
  useEffect(() => {
    const subscriptions = [
      MoonshineStt.addListener('onLine', (line) =>
        setLines((current) => upsertLine(current, line)),
      ),
      MoonshineStt.addListener('onLevel', (event) => {
        level.value = event.level;
      }),
      MoonshineStt.addListener('onError', (event) => setError(event.message)),
    ];

    MoonshineStt.load()
      .then(() => setPhase('ready'))
      .catch((loadError: Error) => {
        setError(loadError.message);
        setPhase('error');
      });

    return () => subscriptions.forEach((subscription) => subscription.remove());
  }, [level]);

  const start = useCallback(async () => {
    setError(null);

    if (!(await requestMicPermission())) {
      setError(MIC_DENIED_MESSAGE);
      return;
    }

    // Every new recording starts with a clean screen.
    setLines([]);
    setPhase('starting');

    try {
      await MoonshineStt.start();
      setPhase('listening');
    } catch (startError) {
      const { code, message } = startError as { code?: string; message: string };
      setError(code === 'E_MIC_DENIED' ? MIC_DENIED_MESSAGE : message);
      setPhase('ready');
    }
  }, []);

  const stop = useCallback(async () => {
    setPhase('stopping');
    await MoonshineStt.stop(); // resolves after the last line has been sent
    setPhase('ready');
  }, []);

  // What the orb calls on tap. Taps while loading or stopping are ignored.
  const toggle = useCallback(() => {
    if (phaseRef.current === 'listening') return stop();
    if (phaseRef.current === 'ready') return start();
  }, [start, stop]);

  return { phase, lines, error, level, toggle };
}
