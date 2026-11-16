import { useRef } from 'react';
import { ArrowUpIcon, TrashIcon } from 'phosphor-react-native';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { useStyles } from './DraftCard.styles';

type DraftCardProps = {
  text: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onDiscard: () => void;
  // Hidden while typing; the keyboard's ✓ is enough then.
  showActions: boolean;
};

// Discard and send sit in opposite corners, as far apart as they can be.
export function DraftCard({ text, onChangeText, onSend, onDiscard, showActions }: DraftCardProps) {
  const styles = useStyles();
  const { scheme, colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const scroll = useRef<ScrollView>(null);
  const opened = useRef(false);
  const canSend = text.trim().length > 0;

  return (
    <View style={styles.area}>
      <Animated.View
        style={styles.card}
        entering={reduceMotion ? undefined : FadeIn.duration(200)}
        exiting={reduceMotion ? undefined : FadeOut.duration(150)}
      >
        <ScrollView
          ref={scroll}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          // Open a long draft at its end once; after that, typing shouldn't yank the view.
          onContentSizeChange={() => {
            if (opened.current) return;
            opened.current = true;
            scroll.current?.scrollToEnd({ animated: false });
          }}
        >
          <TextInput
            style={styles.editor}
            value={text}
            onChangeText={onChangeText}
            multiline
            // The ScrollView around it does the scrolling.
            scrollEnabled={false}
            selectionColor={colors.accent}
            cursorColor={colors.accent}
            keyboardAppearance={scheme}
            accessibilityLabel="Draft, editable"
          />
        </ScrollView>

        {showActions && (
          <View style={styles.actions}>
            <Pressable
              onPress={onDiscard}
              accessibilityRole="button"
              accessibilityLabel="Discard draft"
              hitSlop={12}
              style={({ pressed }) => [styles.discard, pressed && styles.pressed]}
            >
              <TrashIcon size={18} color={colors.textMuted} />
            </Pressable>
            <Pressable
              onPress={onSend}
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel="Save to today's note"
              hitSlop={12}
              style={({ pressed }) => [
                styles.send,
                !canSend && styles.sendDisabled,
                pressed && styles.pressed,
              ]}
            >
              <ArrowUpIcon size={18} weight="bold" color={colors.background} />
            </Pressable>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
