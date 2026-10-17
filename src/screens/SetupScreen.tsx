import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Orb } from '../components/Orb/Orb';
import { formatMegabytes, packBytes, SPEECH_EN } from '../features/models/packs';
import type { PackErrorCode, PackState } from '../features/models/useModelPack';
import { styles } from './SetupScreen.styles';

const ORB_SIZE = 160;
const MODEL_BYTES = packBytes(SPEECH_EN);

function errorMessage(code: PackErrorCode): string {
  switch (code) {
    case 'E_NETWORK':
      return 'Couldn’t reach the download server. Check your connection and try again.';
    case 'E_CHECKSUM':
      return 'Part of the download was damaged. Trying again will fix it.';
    case 'E_STORAGE':
      return 'Couldn’t save the model on this phone. Free up some space and try again.';
    case 'E_SPACE':
      return `Pustakam needs ${formatMegabytes(MODEL_BYTES * 1.1)} free to download its speech model.`;
    default:
      return 'Something went wrong with the download. Try again.';
  }
}

type SetupScreenProps = {
  state: Exclude<PackState, { status: 'checking' } | { status: 'ready' }>;
  onStart: () => void;
  onCancel: () => void;
};

// First launch: explains that speech is turned into text on the phone, then downloads
// the speech model once. Every launch after that skips this screen.
export function SetupScreen({ state, onStart, onCancel }: SetupScreenProps) {
  const downloading = state.status === 'downloading';
  const fraction = downloading ? state.bytesDone / Math.max(state.bytesTotal, 1) : 0;

  // The orb wakes up as the download arrives.
  const level = useSharedValue(0);
  useEffect(() => {
    level.value = downloading ? 0.01 + fraction * 0.05 : 0;
  }, [downloading, fraction, level]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.intro}>
        <Text style={styles.appName}>pustakam</Text>
        {/* Decoration here, not a button, so screen readers skip it. */}
        <View
          style={styles.orb}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
        >
          <Orb
            phase={downloading ? 'ready' : 'loading'}
            level={level}
            size={ORB_SIZE}
            onPress={() => {}}
          />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Your voice stays on this phone.
        </Text>
        <Text style={styles.body}>
          Pustakam turns speech into text right here, with no internet. First it needs its speech
          model.
        </Text>
      </View>

      <View style={styles.footer}>
        {state.status === 'missing' && (
          <>
            <Text style={styles.meta}>
              {formatMegabytes(MODEL_BYTES)} · one time · Wi-Fi recommended
            </Text>
            <PrimaryButton label="download" onPress={onStart} />
          </>
        )}

        {state.status === 'downloading' && (
          <>
            <View
              style={styles.track}
              accessibilityRole="progressbar"
              accessibilityLabel="Downloading speech model"
              accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }}
            >
              <View style={[styles.fillBar, { width: `${fraction * 100}%` }]} />
            </View>
            <Text style={styles.meta}>
              downloading · {formatMegabytes(state.bytesDone)} of{' '}
              {formatMegabytes(state.bytesTotal)}
            </Text>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              hitSlop={12}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.link}>cancel</Text>
            </Pressable>
          </>
        )}

        {state.status === 'error' && (
          <>
            <Text style={styles.error} accessibilityRole="alert">
              {errorMessage(state.code)}
            </Text>
            <PrimaryButton label="try again" onPress={onStart} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}
