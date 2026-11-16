import { useEffect, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

const BOTTOM_THRESHOLD = 32;

// Follows new text until the user scrolls up, then offers a jump-to-latest button.
export function useStickToBottom(hasContent: boolean) {
  const ref = useRef<ScrollView>(null);
  const isPinned = useRef(true); // a ref, not state: changing it shouldn't re-render
  const [showJumpButton, setShowJumpButton] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // A new recording cleared the text, so start following from the top again.
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
