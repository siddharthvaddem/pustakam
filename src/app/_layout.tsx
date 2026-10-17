import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  useFonts,
} from '@expo-google-fonts/jetbrains-mono';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { DatabaseProvider } from '../db/DatabaseProvider';
import { SpeechModelGate } from '../features/models/SpeechModelGate';
import { colors } from '../theme';

// App-wide setup: gestures (for the side menu), keyboard handling, fonts, the
// first-launch speech model download, the database and the status bar. Screens live
// in (drawer)/ (tabs inside a side menu), with settings/ and notes/ pushed on top.
export default function RootLayout() {
  // The font files are bundled with the app, so this never hits the network.
  const [fontsLoaded] = useFonts({ JetBrainsMono_400Regular, JetBrainsMono_500Medium });

  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <StatusBar style="light" />
        {fontsLoaded ? (
          <SpeechModelGate>
            <DatabaseProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                }}
              />
            </DatabaseProvider>
          </SpeechModelGate>
        ) : (
          <View style={styles.root} />
        )}
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
