export const palette = {
  primary: '#6200ee',
  success: '#4caf50',
  info: '#2196f3',
  warning: '#ff9800',
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#212121',
  textInverse: '#ffffff',
} as const;

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
} as const;

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
} as const;