import { useEffect, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

const BOTTOM_THRESHOLD = 32;

// Auto-scroll for the transcript: follow new text as it arrives, but stop
// following if the user scrolls up to read, and show a "jump to latest" button instead.
export function useStickToBottom(hasContent: boolean) {
  const ref = useRef<ScrollView>(null);
  const isPinned = useRef(true); // a ref, not state: changing it shouldn't re-render
  const [showJumpButton, setShowJumpButton] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // A new recording cleared the text, so go back to the top and start following again.
  useEffect(() => {
    if (hasContent) return;
    isPinned.current = true;
    setShowJumpButton(false);
    ref.current?.scrollTo({ y: 0, animated: false });
  }, [hasContent]);

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;

    isPinned.current = distanceFromBottom < BOTTOM_THRESHOLD;
    if (isPinned.current) setShowJumpButton(false);
    setIsScrolled(contentOffset.y > 4);
  }

  // Runs whenever new words make the text taller.
  function onContentSizeChange() {
    if (isPinned.current) {
      ref.current?.scrollToEnd({ animated: true });
    } else {
      setShowJumpButton(true);
    }
  }

  function jumpToLatest() {
    isPinned.current = true;
    setShowJumpButton(false);
    ref.current?.scrollToEnd({ animated: true });
  }

  return { ref, onScroll, onContentSizeChange, showJumpButton, isScrolled, jumpToLatest };
}
