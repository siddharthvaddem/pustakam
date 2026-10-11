import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './NotesScreen.styles';

// The list of saved notes. Saving doesn't exist yet, so for now it's always empty.
export function NotesScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title} accessibilityRole="header">
        notes
      </Text>
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>no notes yet</Text>
        <Text style={styles.emptyHint}>what you record will show up here</Text>
      </View>
    </SafeAreaView>
  );
}
