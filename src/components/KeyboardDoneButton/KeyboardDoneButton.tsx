import { CheckIcon } from 'phosphor-react-native';
import { Keyboard, Pressable } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useTheme } from '../../theme';
import { useStyles } from './KeyboardDoneButton.styles';

const GAP = 12;
// Pushes the button below the screen edge while the keyboard is closed.
const HIDDEN_OFFSET = 80;

// Render it last so it floats over everything else.
export function KeyboardDoneButton() {
  const styles = useStyles();
  const { colors } = useTheme();
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
        <CheckIcon size={22} weight="bold" color={colors.accent} />
      </Pressable>
    </KeyboardStickyView>
  );
}
