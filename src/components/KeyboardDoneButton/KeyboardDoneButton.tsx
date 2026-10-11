import Ionicons from '@expo/vector-icons/Ionicons';
import { Keyboard, Pressable } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { colors } from '../../theme';
import { styles } from './KeyboardDoneButton.styles';

// Gap between the button and the top of the keyboard.
const GAP = 12;
// Pushes the button below the screen edge while the keyboard is closed.
const HIDDEN_OFFSET = 80;

// Round check button that rides just above the keyboard and closes it.
// Put it last in the screen so it floats over everything else.
export function KeyboardDoneButton() {
  return (
    <KeyboardStickyView
      style={styles.dock}
      offset={{ closed: HIDDEN_OFFSET, opened: -GAP }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={() => Keyboard.dismiss()}
        accessibilityRole="button"
        accessibilityLabel="Done editing"
        style={styles.button}
        hitSlop={8}
      >
        <Ionicons name="checkmark" size={22} color={colors.accent} />
      </Pressable>
    </KeyboardStickyView>
  );
}
