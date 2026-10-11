import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  useFonts,
} from '@expo-google-fonts/jetbrains-mono';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RecordScreen } from './screens/RecordScreen';
import { colors } from './theme';

// App-wide setup only. When we add tabs (record, notes, ...), we'll use tab navigator
export default function App() {
  // The font files are bundled with the app, so this never hits the network.
  const [fontsLoaded] = useFonts({ JetBrainsMono_400Regular, JetBrainsMono_500Medium });

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <StatusBar style="light" />
        {fontsLoaded ? (
          <RecordScreen />
        ) : (
          <View style={{ flex: 1, backgroundColor: colors.background }} />
        )}
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
