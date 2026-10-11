import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { Line } from '../../hooks/useTranscriber';
import { colors } from '../../theme';
import { Caret } from './Caret';
import { styles } from './Transcript.styles';
import { TranscriptLine } from './TranscriptLine';
import { useStickToBottom } from './useStickToBottom';

type TranscriptProps = {
  // What's being said right now.
  lines: Line[];
  listening: boolean;
  // The draft so far, shown above the new words when you record more before sending.
  text: string;
};

// The live text above the orb, styled after Monkeytype: dim while Moonshine is
// still guessing, bright once a line is final, with a blinking caret at the end.
export function Transcript({ lines, listening, text }: TranscriptProps) {
  const scroll = useStickToBottom(lines.length > 0 || text.length > 0);
  const lastIndex = lines.length - 1;
  const showLive = listening || lines.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scroll.ref}
        onScroll={scroll.onScroll}
        onContentSizeChange={scroll.onContentSizeChange}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        accessibilityLiveRegion="polite"
      >
        {showLive ? (
          <>
            {text ? <Text style={styles.draft}>{text}</Text> : null}
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
              {/* Before the first word, just the caret. */}
              {listening && lines.length === 0 && <Caret />}
            </View>
          </>
        ) : (
          <Text style={styles.placeholder}>what&apos;s on your mind?</Text>
        )}
      </ScrollView>

      {/* Fades out text that scrolled off the top, so you can tell there's more above. */}
      {scroll.isScrolled && (
        <LinearGradient
          style={styles.topFade}
          colors={[colors.background, `${colors.background}00`]}
          pointerEvents="none"
        />
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
