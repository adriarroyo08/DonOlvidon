import React from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProducts } from '../hooks/useProducts';
import { useTheme } from '../hooks/useColorScheme';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { EmptyState } from '../components/EmptyState';
import { ProductCategory, Product } from '../types';
import { spacing, borderRadius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ProductsScreen() {
  const navigation = useNavigation<Nav>();
  const { products, loading, filters, setFilters } = useProducts();
  const { colors } = useTheme();

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleSearch = (query: string) => {
    setFilters({ ...filters, search: query });
  };

  const handleCategory = (category: ProductCategory | null) => {
    setFilters({ ...filters, category });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={handleProductPress} />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <SearchBar onSearch={handleSearch} />
            <View style={{ marginTop: spacing.sm }}>
              <CategoryFilter
                selected={filters.category}
                onSelect={handleCategory}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : (
            <EmptyState
              title="Sin productos"
              subtitle="Anade tu primer producto para empezar a gestionar sus garantias."
            />
          )
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddProduct', undefined)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingTop: spacing.md, paddingBottom: spacing.sm },
  content: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
