import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, ProductCategory, ProductStatus } from '../types';
import { supabase } from '../config/supabase';
import {
  initDatabase,
  getProducts,
  insertProduct,
  updateProduct,
  deleteProduct,
  calculateWarrantyEndDate,
  getWarrantyStatus,
} from '../services/database';
import { useAuth } from './useAuth';

interface Filters {
  category: ProductCategory | null;
  status: ProductStatus | null;
  search: string;
}

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ category: null, status: null, search: '' });

  const loadProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      await initDatabase();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('warranty_end_date', { ascending: true });

      if (data && !error) {
        setProducts(data);
      } else {
        const local = await getProducts(user.id);
        setProducts(local);
      }
    } catch {
      const local = await getProducts(user.id);
      setProducts(local);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = useCallback(
    async (input: Omit<Product, 'id' | 'user_id' | 'warranty_end_date' | 'status' | 'created_at'>) => {
      if (!user) return;
      const now = new Date().toISOString();
      const warrantyEndDate = calculateWarrantyEndDate(input.purchase_date, input.warranty_months);
      const product: Product = {
        ...input,
        id: crypto.randomUUID(),
        user_id: user.id,
        warranty_end_date: warrantyEndDate,
        status: getWarrantyStatus(warrantyEndDate),
        created_at: now,
      };

      await insertProduct(product);
      await supabase.from('products').insert(product);
      await loadProducts();
      return product;
    },
    [user, loadProducts]
  );

  const editProduct = useCallback(
    async (product: Product) => {
      const warrantyEndDate = calculateWarrantyEndDate(product.purchase_date, product.warranty_months);
      const updated = {
        ...product,
        warranty_end_date: warrantyEndDate,
        status: getWarrantyStatus(warrantyEndDate),
      };
      await updateProduct(updated);
      await supabase.from('products').update(updated).eq('id', updated.id);
      await loadProducts();
    },
    [loadProducts]
  );

  const removeProduct = useCallback(
    async (id: string) => {
      await deleteProduct(id);
      await supabase.from('products').delete().eq('id', id);
      await loadProducts();
    },
    [loadProducts]
  );

  const filtered = useMemo(() => {
    let result = products;
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }
    if (filters.status) {
      result = result.filter((p) => p.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.store_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, filters]);

  const stats = useMemo(() => {
    const active = products.filter((p) => p.status === 'active').length;
    const expired = products.filter((p) => p.status === 'expired').length;
    const expiringSoon = products.filter((p) => {
      const days = Math.ceil(
        (new Date(p.warranty_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return days > 0 && days <= 30;
    }).length;
    return { active, expired, expiringSoon, total: products.length };
  }, [products]);

  return {
    products: filtered,
    allProducts: products,
    stats,
    loading,
    filters,
    setFilters,
    addProduct,
    editProduct,
    removeProduct,
    refresh: loadProducts,
  };
}
