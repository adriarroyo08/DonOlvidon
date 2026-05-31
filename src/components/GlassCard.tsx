import React from 'react';
import { ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../hooks/useColorScheme';
import { borderRadius } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export function GlassCard({ children, style, intensity = 40 }: Props) {
  const { isDark, colors } = useTheme();
  return (
    <BlurView
      intensity={intensity}
      tint={isDark ? 'dark' : 'light'}
      style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }, style]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
  },
});
