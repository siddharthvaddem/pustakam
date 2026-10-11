import { Drawer } from 'expo-router/drawer';
import { DrawerContent } from '../../components/DrawerContent/DrawerContent';
import { colors } from '../../theme';

// The side menu that wraps the tabs. Open it with the menu button or a swipe
// from the left edge.
export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        // The app slides over to make room, instead of the menu covering it.
        drawerType: 'slide',
        overlayColor: 'transparent',
        drawerStyle: { backgroundColor: colors.background, width: '80%' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
