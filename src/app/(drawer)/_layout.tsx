import { Drawer } from 'expo-router/drawer';
import { DrawerContent } from '../../components/DrawerContent/DrawerContent';
import { useTheme } from '../../theme';

export default function DrawerLayout() {
  const { colors } = useTheme();
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        // The app slides over instead of the menu covering it.
        drawerType: 'slide',
        overlayColor: 'transparent',
        drawerStyle: { backgroundColor: colors.background, width: '80%' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
