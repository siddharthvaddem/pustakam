import { Tabs } from 'expo-router';
import { GlassTabBar } from '../../../components/GlassTabBar/GlassTabBar';
import { haptics } from '../../../features/appearance/haptics';
import { TABS } from '../../../navigation/tabs';
import { useTheme } from '../../../theme';

// Tabs are listed in navigation/tabs.ts.
export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
      screenListeners={{
        tabPress: () => haptics.select(),
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}
