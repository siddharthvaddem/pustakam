import Feather from '@expo/vector-icons/Feather';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { router, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TABS } from '../../navigation/tabs';
import { colors } from '../../theme';
import { IconButton } from '../IconButton/IconButton';
import { styles } from './DrawerContent.styles';

// What's inside the side menu: the app name, the tabs, and settings at the bottom.
export function DrawerContent({ navigation }: DrawerContentComponentProps) {
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
            <Feather name={tab.icon} size={22} color={colors.text} />
            <Text style={styles.itemLabel}>{tab.title}</Text>
          </Pressable>
        );
      })}

      <View style={styles.footer}>
        <IconButton
          icon="settings"
          accessibilityLabel="Settings"
          onPress={() => open('/settings')}
        />
      </View>
    </View>
  );
}
