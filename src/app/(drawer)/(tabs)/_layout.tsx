import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { TABS } from '../../../navigation/tabs';
import { colors } from '../../../theme';

// Bottom tab bar: thin line icons, no labels, no divider. The tab you're on
// is white, the rest are grey. The tabs themselves are listed in navigation/tabs.ts.
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
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.title,
            tabBarIcon: ({ color }) => <Feather name={tab.icon} size={24} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
