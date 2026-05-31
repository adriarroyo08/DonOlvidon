import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProducts } from '../hooks/useProducts';
import { useTheme } from '../hooks/useColorScheme';
import { GlassCard } from '../components/GlassCard';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { AdBanner } from '../components/AdBanner';
import { typography, spacing } from '../theme';
import { Product } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { allProducts, stats, loading } = useProducts();
  const { colors } = useTheme();

  const expiringProducts = allProducts.filter((p) => {
    const days = Math.ceil(
      (new Date(p.warranty_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 && days <= 30;
  });

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const statCards = [
    { label: 'Activas', value: stats.active, color: colors.success },
    { label: 'Por vencer', value: stats.expiringSoon, color: colors.warning },
    { label: 'Expiradas', value: stats.expired, color: colors.danger },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[typography.h1, { color: colors.text }]}>Don Olvidon</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.iconBtn}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.iconBtn}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AdBanner />

        <View style={styles.statsRow}>
          {statCards.map((s) => (
            <GlassCard key={s.label} style={styles.statCard}>
              <Text style={[typography.h2, { color: s.color }]}>{s.value}</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                {s.label}
              </Text>
            </GlassCard>
          ))}
        </View>

        <Text style={[typography.h3, { color: colors.text, marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Vencen pronto
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : expiringProducts.length === 0 ? (
          <EmptyState
            title="Todo en orden"
            subtitle="No tienes garantias a punto de vencer en los proximos 30 dias."
          />
        ) : (
          <View style={styles.list}>
            {expiringProducts.map((p) => (
              <ProductCard key={p.id} product={p} onPress={handleProductPress} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  headerIcons: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8 },
  scroll: { paddingBottom: spacing.xl },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  list: { paddingHorizontal: spacing.md },
});
