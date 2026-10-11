import Feather from '@expo/vector-icons/Feather';
import { useRef } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { colors } from '../../theme';
import { styles } from './DraftCard.styles';

type DraftCardProps = {
  text: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onDiscard: () => void;
  // Hidden while typing, so the card is just your words and the keyboard's ✓.
  showActions: boolean;
};

// What you said, waiting to be sent: a soft card like a message in a compose box.
// Discard sits bottom-left and send bottom-right, as far apart as they can be.
export function DraftCard({ text, onChangeText, onSend, onDiscard, showActions }: DraftCardProps) {
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
          // A long draft opens at its end, where you stopped talking. After that,
          // typing shouldn't yank the view around.
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
            keyboardAppearance="dark"
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
              <Feather name="trash-2" size={18} color={colors.textMuted} />
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
              <Feather name="arrow-up" size={18} color={colors.background} />
            </Pressable>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
