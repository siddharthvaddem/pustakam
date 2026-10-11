import Feather from '@expo/vector-icons/Feather';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card/Card';
import { TopBar } from '../components/TopBar/TopBar';
import type { Keyterm } from '../db/schema';
import {
  BOOST_DEFAULT,
  BOOST_MAX,
  BOOST_MIN,
  BOOST_STEP,
  describeBoost,
} from '../features/keyterms/boost';
import { addKeyterm, removeKeyterm, renameKeyterm } from '../features/keyterms/repository';
import { useKeyterms } from '../features/keyterms/useKeyterms';
import {
  MAX_TERM_LENGTH,
  MAX_TERMS,
  TOO_MANY_TERMS,
  validateTerm,
} from '../features/keyterms/validate';
import { setSetting } from '../features/settings/repository';
import { useSetting } from '../features/settings/useSetting';
import { colors } from '../theme';
import { styles } from './KeytermsScreen.styles';

function showTips() {
  Alert.alert(
    'Tips',
    [
      'Add names one part at a time: the first name and the last name as separate words. A phrase is only boosted as a whole, so saying just the first name wouldn’t get any help.',
      'Spell and capitalise it exactly as you want it to appear.',
      `Boost strength ${BOOST_DEFAULT} works well for most names. Higher catches more, but the app may start hearing your words when they weren’t said.`,
    ].join('\n\n'),
  );
}

// Settings → Keyword boosting: the words the speech model should lean towards,
// and how strongly.
export function KeytermsScreen() {
  const terms = useKeyterms();
  const [error, setError] = useState<string | null>(null);

  // The "add a word" field keeps its own text. After each add it's swapped for a
  // fresh, empty one (new key) instead of being cleared: on iOS a cleared field can
  // bring old text back on the next keystroke, merging two words into one.
  const textRef = useRef('');
  const [hasText, setHasText] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  async function add(text: string) {
    // Problems we can spot instantly keep the text in the field so it can be fixed.
    const check = validateTerm(text);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    if (terms.length >= MAX_TERMS) {
      setError(TOO_MANY_TERMS);
      return;
    }

    textRef.current = '';
    setHasText(false);
    setInputKey((key) => key + 1);

    // The only other failure is a duplicate, and that word is already in the list below.
    const result = await addKeyterm(text);
    setError(result.ok ? null : result.error);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar
        icon="chevron-left"
        accessibilityLabel="Back"
        onPress={() => router.back()}
        title="Keyword boosting"
        action={{ icon: 'info', accessibilityLabel: 'Tips', onPress: showTips }}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <Text style={styles.intro}>
          Names and words the app keeps getting wrong. They&apos;ll be spelled exactly as you type
          them here.
        </Text>

        <Card>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              key={inputKey}
              // Keep typing straight into the fresh field after adding a word.
              autoFocus={inputKey > 0}
              onChangeText={(text) => {
                textRef.current = text;
                setHasText(text.trim().length > 0);
                setError(null);
              }}
              onSubmitEditing={(event) => add(event.nativeEvent.text)}
              placeholder="add a word"
              placeholderTextColor={colors.textMuted}
              maxLength={MAX_TERM_LENGTH}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              submitBehavior="submit"
              cursorColor={colors.text}
              selectionColor={colors.textMuted}
              keyboardAppearance="dark"
              accessibilityLabel="New word"
            />
            <Pressable
              onPress={() => add(textRef.current)}
              disabled={!hasText}
              accessibilityRole="button"
              accessibilityLabel="Add word"
              hitSlop={12}
            >
              <Feather name="plus" size={22} color={hasText ? colors.text : colors.textMuted} />
            </Pressable>
          </View>
        </Card>
        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <Card>
          {terms.length === 0 ? (
            <Text style={styles.empty}>No words yet.</Text>
          ) : (
            terms.map((keyterm) => (
              <TermRow key={keyterm.id} keyterm={keyterm} onError={setError} />
            ))
          )}
        </Card>

        <Text style={styles.sectionLabel}>boost strength</Text>
        <BoostSlider />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

// One word in the list. Tap it to rename; the × deletes it.
function TermRow({
  keyterm,
  onError,
}: {
  keyterm: Keyterm;
  onError: (error: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(keyterm.term);

  async function save(text: string) {
    if (text === keyterm.term) {
      setEditing(false);
      return;
    }
    const result = await renameKeyterm(keyterm.id, text);
    if (result.ok) {
      setEditing(false);
      onError(null);
    } else {
      onError(result.error);
    }
  }

  return (
    <View style={styles.row}>
      {editing ? (
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={(event) => save(event.nativeEvent.text)}
          onBlur={() => {
            setDraft(keyterm.term);
            setEditing(false);
          }}
          autoFocus
          maxLength={MAX_TERM_LENGTH}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          submitBehavior="blurAndSubmit"
          cursorColor={colors.text}
          selectionColor={colors.textMuted}
          keyboardAppearance="dark"
          accessibilityLabel={`Rename ${keyterm.term}`}
        />
      ) : (
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            setDraft(keyterm.term);
            setEditing(true);
          }}
          accessibilityRole="button"
          accessibilityHint="Double tap to rename"
        >
          <Text style={styles.term}>{keyterm.term}</Text>
        </Pressable>
      )}
      <Pressable
        onPress={() => removeKeyterm(keyterm.id)}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${keyterm.term}`}
        hitSlop={12}
      >
        <Feather name="x" size={20} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

// Drag to set how strongly the model leans towards your words. The value updates
// live while dragging but is only saved on release, since each change reloads the model.
function BoostSlider() {
  const saved = Number(useSetting('keytermBoost'));
  const [value, setValue] = useState(saved);

  useEffect(() => setValue(saved), [saved]);

  return (
    <Card>
      <View style={styles.sliderBlock}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderValue}>{value.toFixed(1)}</Text>
          {value !== BOOST_DEFAULT ? (
            <Pressable
              onPress={() => setSetting('keytermBoost', String(BOOST_DEFAULT))}
              accessibilityRole="button"
              hitSlop={12}
            >
              <Text style={styles.resetText}>reset</Text>
            </Pressable>
          ) : null}
        </View>
        <Slider
          minimumValue={BOOST_MIN}
          maximumValue={BOOST_MAX}
          step={BOOST_STEP}
          value={value}
          onValueChange={setValue}
          onSlidingComplete={(next) => setSetting('keytermBoost', String(next))}
          minimumTrackTintColor={colors.text}
          maximumTrackTintColor={colors.divider}
          thumbTintColor={colors.text}
          accessibilityLabel="Boost strength"
        />
        <View style={styles.sliderScale}>
          <Text style={styles.presetHint}>{BOOST_MIN}</Text>
          <Text style={styles.presetHint}>{BOOST_MAX}</Text>
        </View>
        <Text style={styles.presetHint}>{describeBoost(value)}</Text>
      </View>
    </Card>
  );
}
