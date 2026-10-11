export const colors = {
  background: '#06070B',
  text: '#E9EBF5',
  textPending: '#9AA1BC',
  textMuted: '#80879F',
  accent: '#EDB160',
  danger: '#FF8A9A',
  surface: '#151826',
} as const;

// Orb shades: one warm amber ramp, with `tint` leaning ember-orange for depth.
export const orbColors = {
  deep: '#331703',
  base: '#905C16',
  lit: '#E09B33',
  tint: '#DD6D45',
  rim: '#F2D6AF',
  sheen: '#FBF0E0',
  halo: '#BE7125',
} as const;

export const fonts = {
  regular: 'JetBrainsMono_400Regular',
  medium: 'JetBrainsMono_500Medium',
} as const;

export const textStyles = {
  transcript: { fontFamily: fonts.regular, fontSize: 22, lineHeight: 33 },
  label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
} as const;
