import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { Line } from '../../hooks/useTranscriber';
import { useTheme } from '../../theme';
import { Caret } from './Caret';
import { useStyles } from './Transcript.styles';
import { TranscriptLine } from './TranscriptLine';
import { useStickToBottom } from './useStickToBottom';

type TranscriptProps = {
  // The current recording.
  lines: Line[];
  listening: boolean;
  // The draft so far, shown above the new words.
  text: string;
};

// Monkeytype-style: dim while Moonshine is guessing, bright once a line is final.
export function Transcript({ lines, listening, text }: TranscriptProps) {
  const styles = useStyles();
  const { colors } = useTheme();
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
                  // Moonshine sometimes never completes older lines, so only the last can be pending.
                  isFinal={line.isComplete || index < lastIndex}
                  showCaret={listening && index === lastIndex}
                />
              ))}
              {listening && lines.length === 0 && <Caret />}
            </View>
          </>
        ) : (
          <Text style={styles.placeholder}>what&apos;s on your mind?</Text>
        )}
      </ScrollView>

      {/* Hints there's more text above. */}
      {scroll.isScrolled && (
        <LinearGradient
          style={styles.topFade}
          colors={[colors.background, `${colors.background}00`]}
          pointerEvents="none"
        />
      )}

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
