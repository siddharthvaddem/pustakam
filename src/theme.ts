import { createContext, useContext } from 'react';
import { StyleSheet } from 'react-native';

export type Scheme = 'dark' | 'light';
export type AccentName = 'amber' | 'ocean' | 'sage' | 'rose' | 'violet';

export type Colors = {
  background: string;
  text: string;
  textPending: string;
  textMuted: string;
  accent: string;
  danger: string;
  surface: string;
  divider: string;
};

// The orb's shades, darkest to brightest. Names match the uniforms in Orb/shader.ts.
export type OrbColors = {
  deep: string;
  base: string;
  lit: string;
  tint: string;
  rim: string;
  sheen: string;
  halo: string;
};

// 6-digit hex only: some styles append an alpha to these.
const base: Record<Scheme, Omit<Colors, 'accent'>> = {
  dark: {
    background: '#06070B',
    text: '#E9EBF5',
    textPending: '#9AA1BC',
    textMuted: '#80879F',
    danger: '#FF8A9A',
    surface: '#151826',
    divider: '#232738',
  },
  light: {
    background: '#F6F5F1',
    text: '#16171D',
    textPending: '#555A6B',
    textMuted: '#6B7082',
    danger: '#B93349',
    surface: '#FFFFFF',
    divider: '#E3E1DA',
  },
};

export const ACCENTS: Record<
  AccentName,
  { label: string; accent: Record<Scheme, string>; orb: OrbColors }
> = {
  amber: {
    label: 'Amber',
    accent: { dark: '#EDB160', light: '#96590C' },
    orb: {
      deep: '#331703',
      base: '#905C16',
      lit: '#E09B33',
      tint: '#DD6D45',
      rim: '#F2D6AF',
      sheen: '#FBF0E0',
      halo: '#BE7125',
    },
  },
  ocean: {
    label: 'Ocean',
    accent: { dark: '#6FB3F2', light: '#1D66AB' },
    orb: {
      deep: '#04182E',
      base: '#165A93',
      lit: '#3F9BE0',
      tint: '#3D6FD6',
      rim: '#BFE0FA',
      sheen: '#EAF5FE',
      halo: '#2A7CC2',
    },
  },
  sage: {
    label: 'Sage',
    accent: { dark: '#8ED1A5', light: '#2A7449' },
    orb: {
      deep: '#062616',
      base: '#1F6B44',
      lit: '#47B37A',
      tint: '#2E9C8A',
      rim: '#C5EBD4',
      sheen: '#EEF9F2',
      halo: '#2F8A5C',
    },
  },
  rose: {
    label: 'Rose',
    accent: { dark: '#F29BB0', light: '#B03458' },
    orb: {
      deep: '#2E0714',
      base: '#8E2A4A',
      lit: '#E0617F',
      tint: '#D64A6E',
      rim: '#F7CBD6',
      sheen: '#FDEEF2',
      halo: '#B83A5E',
    },
  },
  violet: {
    label: 'Violet',
    accent: { dark: '#B9A2F5', light: '#6347BE' },
    orb: {
      deep: '#170A33',
      base: '#4F2E99',
      lit: '#8E6BE6',
      tint: '#6C4BD6',
      rim: '#DCCFFA',
      sheen: '#F4F0FE',
      halo: '#6E4CC9',
    },
  },
};

export type Theme = { scheme: Scheme; accentName: AccentName; colors: Colors; orb: OrbColors };

// One object per scheme+accent, since makeStyles caches on identity.
const themes = new Map<string, Theme>();
export function themeFor(scheme: Scheme, accentName: AccentName): Theme {
  const key = `${scheme}-${accentName}`;
  let theme = themes.get(key);
  if (!theme) {
    const { accent, orb } = ACCENTS[accentName];
    theme = { scheme, accentName, colors: { ...base[scheme], accent: accent[scheme] }, orb };
    themes.set(key, theme);
  }
  return theme;
}

export const ThemeContext = createContext<Theme>(themeFor('dark', 'amber'));

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

// e.g. `export const useStyles = makeStyles((c) => ({ ... }))`.
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(build: (colors: Colors) => T) {
  const cache = new WeakMap<Colors, T>();
  return function useStyles(): T {
    const { colors } = useTheme();
    let styles = cache.get(colors);
    if (!styles) {
      styles = StyleSheet.create(build(colors));
      cache.set(colors, styles);
    }
    return styles;
  };
}

export const fonts = {
  regular: 'JetBrainsMono_400Regular',
  medium: 'JetBrainsMono_500Medium',
} as const;

export const textStyles = {
  transcript: { fontFamily: fonts.regular, fontSize: 22, lineHeight: 33 },
  label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  title: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 24 },
  appName: { fontFamily: fonts.medium, fontSize: 28, lineHeight: 34 },
} as const;
