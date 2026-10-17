import Feather from '@expo/vector-icons/Feather';
import { type Href, router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card/Card';
import { TopBar } from '../components/TopBar/TopBar';
import { DEV_TOOLS } from '../dev/enabled';
import { useKeyterms } from '../features/keyterms/useKeyterms';
import { colors } from '../theme';
import { styles } from './SettingsScreen.styles';

type Row = {
  icon: ComponentProps<typeof Feather>['name'];
  label: string;
  // Small grey value shown before the chevron, like how many keywords there are.
  detail?: string;
  // Rows without a destination are placeholders for features that don't exist yet.
  href?: Href;
};

function SettingsRow({ icon, label, detail, href }: Row) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={href ? () => router.push(href) : undefined}
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
  const keytermCount = useKeyterms().length;

  const groups: Row[][] = [
    [
      {
        icon: 'zap',
        label: 'Keyword boosting',
        detail: keytermCount ? String(keytermCount) : undefined,
        href: '/settings/keyterms',
      },
    ],
    [
      { icon: 'bell', label: 'Notifications' },
      { icon: 'droplet', label: 'Appearance' },
    ],
    [
      { icon: 'download', label: 'Export notes' },
      { icon: 'info', label: 'About' },
    ],
  ];
  if (DEV_TOOLS) groups.push([{ icon: 'tool', label: 'Developer', href: '/settings/developer' }]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar
        icon="chevron-left"
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
