import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card/Card';
import { TopBar } from '../components/TopBar/TopBar';
import { measureEmbeddingSpeed } from '../dev/embeddingSpeed';
import { DEV_TOOLS } from '../dev/enabled';
import { countSampleNotes, loadSampleNotes, removeSampleNotes } from '../dev/sampleNotes';
import { useModelPath } from '../features/models/ModelGate';
import { SEARCH_EMBED } from '../features/models/packs';
import { styles } from './DeveloperScreen.styles';

// Settings → Developer: testing tools. Renders nothing unless DEV_TOOLS is on.
export function DeveloperScreen() {
  const [sampleCount, setSampleCount] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const embedModel = `${useModelPath(SEARCH_EMBED)}/${SEARCH_EMBED.files[0].name}`;

  const refresh = useCallback(() => {
    countSampleNotes().then(setSampleCount);
  }, []);

  useEffect(refresh, [refresh]);

  async function run(label: string, action: () => Promise<string>) {
    setStatus(`${label}…`);
    try {
      setStatus(await action());
    } catch (error) {
      setStatus(`${label} failed: ${(error as Error).message}`);
    }
    refresh();
  }

  if (!DEV_TOOLS) return null;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar
        icon="chevron-left"
        accessibilityLabel="Back"
        onPress={() => router.back()}
        title="Developer"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>sample notes</Text>
        <Card>
          <View style={styles.info}>
            <Text style={styles.body}>
              Fictional notes over the last six weeks, for testing. Your own notes are never
              touched.
            </Text>
            <Text style={styles.detail}>
              {sampleCount === null ? '…' : `${sampleCount} loaded`}
            </Text>
          </View>
          <ActionRow
            label="Load sample notes"
            onPress={() =>
              run('Loading', async () => `Loaded ${await loadSampleNotes()} sample notes`)
            }
          />
          <ActionRow
            label="Remove sample notes"
            onPress={() =>
              run('Removing', async () => {
                await removeSampleNotes();
                return 'Removed the sample notes';
              })
            }
          />
        </Card>

        <Text style={styles.sectionLabel}>embedding speed</Text>
        <Card>
          <View style={styles.info}>
            <Text style={styles.body}>
              Loads the search model and times it on 50 sample notes. Takes a few seconds.
            </Text>
          </View>
          {(['cpu', 'gpu'] as const).map((backend) => (
            <ActionRow
              key={backend}
              label={`Run on ${backend.toUpperCase()}`}
              onPress={() =>
                run(`Timing ${backend.toUpperCase()}`, async () =>
                  measureEmbeddingSpeed(embedModel, backend),
                )
              }
            />
          ))}
        </Card>

        {status ? <Text style={styles.status}>{status}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text style={styles.rowLabel}>{label}</Text>
    </Pressable>
  );
}
