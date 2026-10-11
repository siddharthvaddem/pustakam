import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { Line } from '../../hooks/useTranscriber';
import { colors } from '../../theme';
import { Caret } from './Caret';
import { FADE_HEIGHT, styles } from './Transcript.styles';
import { TranscriptLine } from './TranscriptLine';
import { useStickToBottom } from './useStickToBottom';

type TranscriptProps = {
  lines: Line[];
  listening: boolean;
};

// The live text above the orb, styled after Monkeytype: dim while Moonshine is
// still guessing, bright once a line is final, with a blinking caret at the end.
export function Transcript({ lines, listening }: TranscriptProps) {
  // Needed to size the fade at the top, which is drawn with Skia.
  const [width, setWidth] = useState(0);
  const scroll = useStickToBottom(lines.length > 0);
  const lastIndex = lines.length - 1;

  return (
    <View style={styles.container} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <ScrollView
        ref={scroll.ref}
        onScroll={scroll.onScroll}
        onContentSizeChange={scroll.onContentSizeChange}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        accessibilityLiveRegion="polite"
      >
        {lines.length === 0 ? (
          // Before any words: a gentle prompt when idle, just the caret once listening.
          listening ? (
            <View style={styles.words}>
              <Caret />
            </View>
          ) : (
            <Text style={styles.placeholder}>what&apos;s on your mind?</Text>
          )
        ) : (
          <View style={styles.words}>
            {lines.map((line, index) => (
              <TranscriptLine
                key={line.id}
                line={line}
                // Moonshine sometimes never marks an older line complete, so only the last one can be pending.
                isFinal={line.isComplete || index < lastIndex}
                showCaret={listening && index === lastIndex}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Fades out text that scrolled off the top, so you can tell there's more above. */}
      {scroll.isScrolled && width > 0 && (
        <Canvas style={[styles.topFade, { width }]} pointerEvents="none">
          <Rect x={0} y={0} width={width} height={FADE_HEIGHT}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, FADE_HEIGHT)}
              colors={[colors.background, `${colors.background}00`]}
            />
          </Rect>
        </Canvas>
      )}

      {/* Shown when you've scrolled up and new words arrive below. */}
      {scroll.showJumpButton && (
        <Pressable
          onPress={scroll.jumpToLatest}
          accessibilityRole="button"
          accessibilityLabel="Jump to latest text"
          style={styles.jumpButton}
          hitSlop={12}
        >
          <Text style={styles.jumpButtonText}>↓ latest</Text>
        </Pressable>
      )}
    </View>
  );
}
