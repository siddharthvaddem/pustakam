import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  useFonts,
} from '@expo-google-fonts/jetbrains-mono';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { colors } from '../theme';

// App-wide setup: fonts, keyboard handling and the status bar.
// The actual screens live in (tabs)/.
export default function RootLayout() {
  // The font files are bundled with the app, so this never hits the network.
  const [fontsLoaded] = useFonts({ JetBrainsMono_400Regular, JetBrainsMono_500Medium });

  return (
    <KeyboardProvider>
      <StatusBar style="light" />
      {fontsLoaded ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.background }} />
      )}
    </KeyboardProvider>
  );
}
