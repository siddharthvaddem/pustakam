import type { ExpoConfig } from 'expo/config';

const BACKGROUND = '#06070B';

// OFFLINE=1 drops Android's network permission to prove the app needs none.
// Dev builds keep it to reach Metro.
const offline = process.env.OFFLINE === '1';

const config: ExpoConfig = {
  name: 'memory-bank',
  slug: 'memory-bank',
  version: '1.0.0',
  orientation: 'portrait',
  // Needed by Expo Router for deep links.
  scheme: 'memorybank',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: BACKGROUND,
  ios: {
    bundleIdentifier: 'com.memorybank.app',
    supportsTablet: true,
    infoPlist: {
      NSMicrophoneUsageDescription:
        'Memory Bank listens to transcribe what you say. Audio is processed on this device and never leaves it.',
    },
  },
  android: {
    package: 'com.memorybank.app',
    adaptiveIcon: {
      backgroundColor: BACKGROUND,
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: ['android.permission.RECORD_AUDIO'],
    blockedPermissions: offline ? ['android.permission.INTERNET'] : [],
  },
  plugins: ['expo-router', ['expo-build-properties', { android: { minSdkVersion: 26 } }]],
};

export default config;
