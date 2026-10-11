import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar/TopBar';
import { useOpenDrawer } from '../navigation/useOpenDrawer';
import { styles } from './NotesScreen.styles';

// The list of saved notes. Saving doesn't exist yet, so for now it's always empty.
export function NotesScreen() {
  const openDrawer = useOpenDrawer();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar icon="menu" accessibilityLabel="Open menu" onPress={openDrawer} title="Notes" />
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>no notes yet</Text>
        <Text style={styles.emptyHint}>what you record will show up here</Text>
      </View>
    </SafeAreaView>
  );
}
