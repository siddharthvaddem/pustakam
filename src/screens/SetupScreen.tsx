import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Orb } from '../components/Orb/Orb';
import { formatMegabytes } from '../features/models/packs';
import type { PackErrorCode, PacksState } from '../features/models/useModelPacks';
import { useStyles } from './SetupScreen.styles';

const ORB_SIZE = 160;

function errorMessage(code: PackErrorCode, bytesNeeded: number): string {
  switch (code) {
    case 'E_NETWORK':
      return 'Couldn’t reach the download server. Check your connection and try again.';
    case 'E_CHECKSUM':
      return 'Part of the download was damaged. Trying again will fix it.';
    case 'E_STORAGE':
      return 'Couldn’t save the models on this phone. Free up some space and try again.';
    case 'E_SPACE':
      return `Pustakam needs ${formatMegabytes(bytesNeeded * 1.1)} free to download its models.`;
    default:
      return 'Something went wrong with the download. Try again.';
  }
}

type SetupScreenProps = {
  state: Exclude<PacksState, { status: 'checking' } | { status: 'ready' }>;
  onStart: () => void;
  onCancel: () => void;
};

// First launch only: downloads the models.
export function SetupScreen({ state, onStart, onCancel }: SetupScreenProps) {
  const styles = useStyles();
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
          Pustakam turns speech into text and finds your notes right here, with no internet. First
          it needs its models.
        </Text>
      </View>

      <View style={styles.footer}>
        {state.status === 'missing' && (
          <>
            <Text style={styles.meta}>
              {formatMegabytes(state.bytesNeeded)} · one time · Wi-Fi recommended
            </Text>
            <PrimaryButton label="download" onPress={onStart} />
          </>
        )}

        {state.status === 'downloading' && (
          <>
            <View
              style={styles.track}
              accessibilityRole="progressbar"
              accessibilityLabel="Downloading models"
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
              {errorMessage(state.code, state.bytesNeeded)}
            </Text>
            <PrimaryButton label="try again" onPress={onStart} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useStyles();
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
