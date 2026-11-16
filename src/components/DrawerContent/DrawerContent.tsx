import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { router, usePathname } from 'expo-router';
import { GearSixIcon } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TABS } from '../../navigation/tabs';
import { useTheme } from '../../theme';
import { IconButton } from '../IconButton/IconButton';
import { useStyles } from './DrawerContent.styles';

export function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  function open(href: Parameters<typeof router.navigate>[0]) {
    navigation.closeDrawer();
    router.navigate(href);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 12 }]}>
      <Text style={styles.appName}>pustakam</Text>

      <Text style={styles.sectionLabel}>tabs</Text>
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Pressable
            key={tab.name}
            onPress={() => open(tab.href)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && styles.itemActive]}
          >
            <Text style={[styles.itemLabel, active && { color: colors.accent }]}>{tab.title}</Text>
          </Pressable>
        );
      })}

      <View style={styles.footer}>
        <IconButton
          icon={GearSixIcon}
          accessibilityLabel="Settings"
          onPress={() => open('/settings')}
        />
      </View>
    </View>
  );
}
