import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Product } from '../types';
import { GlassCard } from './GlassCard';
import { WarrantyCountdown } from './WarrantyCountdown';
import { StatusBadge } from './StatusBadge';
import { useTheme } from '../hooks/useColorScheme';
import { CATEGORY_LABELS } from '../constants/categories';
import { typography, spacing } from '../theme';

interface Props {
  product: Product;
  onPress: (product: Product) => void;
}

export function ProductCard({ product, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={() => onPress(product)} activeOpacity={0.7}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h3, { color: colors.text }]} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {product.brand} {product.model && `· ${product.model}`}
            </Text>
          </View>
          <StatusBadge status={product.status} />
        </View>

        <View style={styles.meta}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {CATEGORY_LABELS[product.category]} · {product.store_name}
          </Text>
        </View>

        <View style={{ marginTop: spacing.sm }}>
          <WarrantyCountdown
            purchaseDate={product.purchase_date}
            warrantyEndDate={product.warranty_end_date}
          />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  meta: { marginTop: 6 },
});
