import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  useFonts,
} from '@expo-google-fonts/jetbrains-mono';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { DatabaseProvider } from '../db/DatabaseProvider';
import { AppearanceProvider } from '../features/appearance/AppearanceProvider';
import { ModelGate } from '../features/models/ModelGate';
import { themeFor, useTheme } from '../theme';

export default function RootLayout() {
  // Fonts are bundled, so this never hits the network.
  const [fontsLoaded] = useFonts({ JetBrainsMono_400Regular, JetBrainsMono_500Medium });
  // Appearance settings live in the DB, so follow the system until it opens.
  const { background } = themeFor(useColorScheme() === 'light' ? 'light' : 'dark', 'amber').colors;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: background }}>
      <KeyboardProvider>
        {fontsLoaded && (
          <DatabaseProvider>
            <AppearanceProvider>
              <ModelGate>
                <Screens />
              </ModelGate>
            </AppearanceProvider>
          </DatabaseProvider>
        )}
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

function Screens() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    />
  );
}
