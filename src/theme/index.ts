import { TextStyle } from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSolid: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  danger: string;
  border: string;
  card: string;
}

export const colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: '#F8F9FE',
    surface: 'rgba(255, 255, 255, 0.7)',
    surfaceSolid: '#FFFFFF',
    primary: '#6366F1',
    primaryLight: '#818CF8',
    secondary: '#8B5CF6',
    text: '#1E1B4B',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: 'rgba(99, 102, 241, 0.1)',
    card: 'rgba(255, 255, 255, 0.6)',
  },
  dark: {
    background: '#0F0D23',
    surface: 'rgba(30, 27, 75, 0.7)',
    surfaceSolid: '#1E1B4B',
    primary: '#818CF8',
    primaryLight: '#A5B4FC',
    secondary: '#A78BFA',
    text: '#F8F9FE',
    textSecondary: '#9CA3AF',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    border: 'rgba(129, 140, 248, 0.15)',
    card: 'rgba(30, 27, 75, 0.6)',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography: Record<string, TextStyle> = {
  h1: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '600', letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  bodySmall: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '500' },
  button: { fontSize: 16, fontWeight: '600' },
};
