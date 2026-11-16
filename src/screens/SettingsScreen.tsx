import { router } from 'expo-router';
import {
  CaretLeftIcon,
  CaretRightIcon,
  DownloadSimpleIcon,
  DropIcon,
  type Icon,
  LightningIcon,
} from 'phosphor-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card/Card';
import { TopBar } from '../components/TopBar/TopBar';
import { useKeyterms } from '../features/keyterms/useKeyterms';
import { exportNotes } from '../features/notes/exportNotes';
import { useTheme } from '../theme';
import { useStyles } from './SettingsScreen.styles';

type Row = {
  icon: Icon;
  label: string;
  // Grey value before the chevron, e.g. the keyword count.
  detail?: string;
  onPress: () => void;
};

function SettingsRow({ icon: RowIcon, label, detail, onPress }: Row) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <RowIcon size={22} color={colors.text} />
      <Text style={styles.label}>{label}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      <CaretRightIcon size={20} color={colors.textMuted} />
    </Pressable>
  );
}

export function SettingsScreen() {
  const styles = useStyles();
  const keytermCount = useKeyterms().length;
  const [exporting, setExporting] = useState(false);

  async function exportAll() {
    setExporting(true);
    try {
      const days = await exportNotes();
      if (days === 0) Alert.alert('No notes yet', 'Record something first, then export.');
    } catch (error) {
      Alert.alert('Couldn’t export your notes', (error as Error).message);
    } finally {
      setExporting(false);
    }
  }

  const groups: Row[][] = [
    [
      {
        icon: LightningIcon,
        label: 'Keyword boosting',
        detail: keytermCount ? String(keytermCount) : undefined,
        onPress: () => router.push('/settings/keyterms'),
      },
      {
        icon: DropIcon,
        label: 'Appearance',
        onPress: () => router.push('/settings/appearance'),
      },
    ],
    [
      {
        icon: DownloadSimpleIcon,
        label: 'Export notes',
        detail: exporting ? 'preparing…' : 'Markdown',
        onPress: exporting ? () => {} : exportAll,
      },
    ],
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar
        icon={CaretLeftIcon}
        accessibilityLabel="Back"
        onPress={() => router.back()}
        title="Settings"
      />
      <ScrollView contentContainerStyle={styles.content}>
        {groups.map((rows, index) => (
          <Card key={index}>
            {rows.map((row) => (
              <SettingsRow key={row.label} {...row} />
            ))}
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
