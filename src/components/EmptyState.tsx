import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useColorScheme';
import { typography, spacing } from '../theme';

interface Props {
  title: string;
  subtitle: string;
}

export function EmptyState({ title, subtitle }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[typography.h2, { color: colors.text }]}>{title}</Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
});
