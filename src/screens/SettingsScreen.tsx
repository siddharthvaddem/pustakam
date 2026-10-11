import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Fragment, type ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar/TopBar';
import { colors } from '../theme';
import { styles } from './SettingsScreen.styles';

type Row = {
  icon: ComponentProps<typeof Feather>['name'];
  label: string;
  // Small grey value shown before the chevron, like the current model.
  detail?: string;
};

// Placeholders for now: none of these open anything yet.
const GROUPS: Row[][] = [
  [
    { icon: 'cpu', label: 'Speech model', detail: 'Small' },
    { icon: 'mic', label: 'Microphone' },
  ],
  [
    { icon: 'bell', label: 'Notifications' },
    { icon: 'droplet', label: 'Appearance' },
    { icon: 'lock', label: 'App lock' },
  ],
  [
    { icon: 'download', label: 'Export notes' },
    { icon: 'info', label: 'About' },
  ],
];

function SettingsRow({ icon, label, detail }: Row) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Feather name={icon} size={22} color={colors.text} />
      <Text style={styles.label}>{label}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      <Feather name="chevron-right" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

export function SettingsScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar
        icon="chevron-left"
        accessibilityLabel="Back"
        onPress={() => router.back()}
        title="Settings"
      />
      <ScrollView contentContainerStyle={styles.content}>
        {GROUPS.map((rows, groupIndex) => (
          <View key={groupIndex} style={styles.group}>
            {rows.map((row, index) => (
              <Fragment key={row.label}>
                {index > 0 && <View style={styles.divider} />}
                <SettingsRow {...row} />
              </Fragment>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
