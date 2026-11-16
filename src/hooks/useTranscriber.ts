import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import MoonshineStt, { type LineEvent } from '../../modules/moonshine-stt';
import { useModelPath } from '../features/models/ModelGate';
import { SPEECH_EN } from '../features/models/packs';

// loading -> ready -> starting -> listening -> stopping -> ready; `error` = model failed to load.
export type Phase = 'loading' | 'ready' | 'starting' | 'listening' | 'stopping' | 'error';
export type Line = LineEvent;

const MIC_DENIED_MESSAGE = 'Microphone access is off. Turn it on in Settings to transcribe.';

// Moonshine re-sends the current line with the same id as it corrects itself.
function upsertLine(lines: Line[], line: Line): Line[] {
  const index = lines.findIndex((existing) => existing.id === line.id);
  if (index === -1) {
    return line.text ? [...lines, line] : lines;
  }
  const next = [...lines];
  next[index] = line;
  return next;
}

function joinLines(lines: Line[]): string {
  return lines
    .map((line) => line.text.trim())
    .filter(Boolean)
    .join(' ');
}

// On iOS the native start() asks instead.
async function requestMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function useTranscriber() {
  const modelPath = useModelPath(SPEECH_EN);
  const [phase, setPhase] = useState<Phase>('loading');
  const [lines, setLines] = useState<Line[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Editable draft of everything recorded since the last clear().
  const [text, setText] = useState('');
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  // Lets stop() read the final lines without waiting for a re-render.
  const linesRef = useRef<Line[]>([]);

  // Shared value so many-per-second level updates don't re-render the screen.
  const level = useSharedValue(0);

  // `toggle` is created once, so it reads these through refs.
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const textRef = useRef(text);
  textRef.current = text;

  useEffect(() => {
    const subscriptions = [
      MoonshineStt.addListener('onLine', (line) => {
        linesRef.current = upsertLine(linesRef.current, line);
        setLines(linesRef.current);
      }),
      MoonshineStt.addListener('onLevel', (event) => {
        level.value = event.level;
      }),
      MoonshineStt.addListener('onError', (event) => setError(event.message)),
    ];

    MoonshineStt.load(modelPath)
      .then(() => setPhase('ready'))
      .catch((loadError: Error) => {
        setError(loadError.message);
        setPhase('error');
      });

    return () => subscriptions.forEach((subscription) => subscription.remove());
  }, [level, modelPath]);

  const start = useCallback(async () => {
    setError(null);

    if (!(await requestMicPermission())) {
      setError(MIC_DENIED_MESSAGE);
      return;
    }

    const now = new Date();
    linesRef.current = [];
    setLines([]);
    setPhase('starting');

    try {
      await MoonshineStt.start();
      if (!textRef.current.trim()) setStartedAt(now);
      setPhase('listening');
    } catch (startError) {
      const { code, message } = startError as { code?: string; message: string };
      setError(code === 'E_MIC_DENIED' ? MIC_DENIED_MESSAGE : message);
      setPhase('ready');
    }
  }, []);

  const clear = useCallback(() => {
    linesRef.current = [];
    setLines([]);
    setText('');
    setStartedAt(null);
  }, []);

  const stop = useCallback(async () => {
    setPhase('stopping');
    await MoonshineStt.stop(); // resolves after the last line is sent

    const draft = [textRef.current.trimEnd(), joinLines(linesRef.current)]
      .filter(Boolean)
      .join('\n');
    linesRef.current = [];
    setLines([]);
    setText(draft);
    if (!draft) setStartedAt(null);
    setPhase('ready');
  }, []);

  const toggle = useCallback(() => {
    if (phaseRef.current === 'listening') return stop();
    if (phaseRef.current === 'ready') return start();
  }, [start, stop]);

  return { phase, lines, text, setText, startedAt, clear, error, level, toggle };
}
