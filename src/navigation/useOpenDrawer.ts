import { DrawerActions, useNavigation } from '@react-navigation/native';

// Opens the side menu from any screen inside it (the action bubbles up to the drawer).
export function useOpenDrawer() {
  const navigation = useNavigation();
  return () => navigation.dispatch(DrawerActions.openDrawer());
}
