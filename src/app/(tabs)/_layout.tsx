import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { colors } from '../../theme';

type IconName = ComponentProps<typeof Feather>['name'];

const ICON_SIZE = 24;

function tabIcon(name: IconName) {
  function TabIcon({ color }: { color: string }) {
    return <Feather name={name} size={ICON_SIZE} color={color} />;
  }
  return TabIcon;
}

// Bottom tab bar: thin line icons, no labels, no divider. The tab you're on
// is white, the rest are grey. Add a tab by adding a file next to this one
// and a <Tabs.Screen> below.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        // Get out of the way while typing in a note.
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: { paddingTop: 6 },
        sceneStyle: { backgroundColor: colors.background },
      }}
      screenListeners={{
        // A light tick when switching tabs.
        tabPress: () => Haptics.selectionAsync(),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Record',
          tabBarAccessibilityLabel: 'Record',
          tabBarIcon: tabIcon('home'),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarAccessibilityLabel: 'Notes',
          tabBarIcon: tabIcon('file-text'),
        }}
      />
    </Tabs>
  );
}
