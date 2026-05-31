import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProductStatus } from '../types';
import { useTheme } from '../hooks/useColorScheme';
import { typography, borderRadius } from '../theme';

const STATUS_CONFIG: Record<ProductStatus, { label: string; colorKey: 'success' | 'danger' | 'warning' }> = {
  active: { label: 'Activa', colorKey: 'success' },
  expired: { label: 'Expirada', colorKey: 'danger' },
  claimed: { label: 'Reclamada', colorKey: 'warning' },
};

interface Props {
  status: ProductStatus;
}

export function StatusBadge({ status }: Props) {
  const { colors } = useTheme();
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: `${colors[config.colorKey]}20` }]}>
      <Text style={[typography.caption, { color: colors[config.colorKey] }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
});
