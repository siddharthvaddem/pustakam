import { memo } from 'react';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import type { Line } from '../../hooks/useTranscriber';
import { Caret } from './Caret';
import { useStyles } from './TranscriptLine.styles';

type TranscriptLineProps = {
  line: Line;
  isFinal: boolean;
  showCaret: boolean;
};

// One element per word so new words fade in alone; memo keeps finished lines from re-rendering.
export const TranscriptLine = memo(function TranscriptLine({
  line,
  isFinal,
  showCaret,
}: TranscriptLineProps) {
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const words = line.text.trim().split(/\s+/).filter(Boolean);

  return (
    <>
      {words.map((word, index) => (
        // Keyed by index so a corrected word updates in place and only new words fade in.
        <Animated.Text
          key={index}
          entering={reduceMotion ? undefined : FadeIn.duration(150)}
          style={[styles.word, isFinal ? styles.final : styles.pending]}
        >
          {word}
        </Animated.Text>
      ))}
      {showCaret && <Caret />}
    </>
  );
});
