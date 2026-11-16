import { DrawerActions, useNavigation } from '@react-navigation/native';

// The action bubbles up to the drawer from any screen inside it.
export function useOpenDrawer() {
  const navigation = useNavigation();
  return () => navigation.dispatch(DrawerActions.openDrawer());
}
