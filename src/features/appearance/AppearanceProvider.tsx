import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ACCENTS, type AccentName, type Scheme, ThemeContext, themeFor } from '../../theme';
import { useSetting } from '../settings/useSetting';
import { setHapticsEnabled } from './haptics';

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const themeSetting = useSetting('theme');
  const accentSetting = useSetting('accent');
  const hapticsOn = useSetting('haptics') === 'on';
  const system = useColorScheme();

  const scheme: Scheme =
    themeSetting === 'light' || themeSetting === 'dark'
      ? themeSetting
      : system === 'light'
        ? 'light'
        : 'dark';
  const accent = (accentSetting in ACCENTS ? accentSetting : 'amber') as AccentName;

  useEffect(() => setHapticsEnabled(hapticsOn), [hapticsOn]);

  return (
    <ThemeContext.Provider value={themeFor(scheme, accent)}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
}
