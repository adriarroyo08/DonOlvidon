import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useColorScheme';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';
import { GlassCard } from '../components/GlassCard';
import { EmptyState } from '../components/EmptyState';
import { typography } from '../theme';

interface NotifItem {
  id: string;
  type: string;
  sent_at: string;
  product_name: string;
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [items, setItems] = useState<NotifItem[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('notifications_log')
      .select('id, type, sent_at, products(name)')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) {
          setItems(
            data.map((d: any) => ({
              id: d.id,
              type: d.type,
              sent_at: d.sent_at,
              product_name: d.products?.name ?? 'Producto',
            }))
          );
        }
      });
  }, [user]);

  const typeLabel: Record<string, string> = {
    push_30d: 'Expira en 30 dias',
    push_7d: 'Expira en 7 dias',
    push_1d: 'Expira manana',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={[styles.list, items.length === 0 && { flex: 1 }]}
        renderItem={({ item }) => (
          <GlassCard style={{ marginBottom: 8 }}>
            <Text style={[typography.body, { color: colors.text }]}>{item.product_name}</Text>
            <Text style={[typography.caption, { color: colors.warning }]}>
              {typeLabel[item.type] ?? item.type}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {new Date(item.sent_at).toLocaleDateString('es-ES')}
            </Text>
          </GlassCard>
        )}
        ListEmptyComponent={
          <EmptyState title="Sin notificaciones" subtitle="Aqui apareceran los avisos de tus garantias" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
});
