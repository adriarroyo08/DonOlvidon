import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProducts } from '../hooks/useProducts';
import { useTheme } from '../hooks/useColorScheme';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { WarrantyCountdown } from '../components/WarrantyCountdown';
import { CATEGORY_LABELS } from '../constants/categories';
import { WARRANTY_LAW } from '../constants/legal';
import { supabase } from '../config/supabase';
import { getReceiptsByProduct, insertReceipt } from '../services/database';
import { Receipt } from '../types';
import { typography, spacing, borderRadius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { removeProduct } = useProducts();
  const { colors } = useTheme();

  const { product } = route.params;
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadReceipts = useCallback(async () => {
    const data = await getReceiptsByProduct(product.id);
    setReceipts(data);
  }, [product.id]);

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (receipts.length === 0) return;
    let cancelled = false;
    const loadUrls = async () => {
      const urls: Record<string, string> = {};
      for (const r of receipts) {
        if (cancelled) return;
        const { data } = await supabase.storage.from('receipts').createSignedUrl(r.storage_path, 3600);
        if (data?.signedUrl) urls[r.storage_path] = data.signedUrl;
      }
      if (!cancelled) setSignedUrls(urls);
    };
    loadUrls();
    return () => { cancelled = true; };
  }, [receipts]);

  const handleAddReceipt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galeria para adjuntar tickets.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'heic'];
      const rawExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const ext = ALLOWED_EXTS.includes(rawExt) ? rawExt : 'jpg';
      const path = `${product.user_id}/${product.id}/${crypto.randomUUID()}.${ext}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      if (blob.size > 10 * 1024 * 1024) {
        Alert.alert('Error', 'La imagen es demasiado grande (máx. 10 MB).');
        return;
      }
      const { error } = await supabase.storage.from('receipts').upload(path, blob);

      if (error) throw error;

      const receipt: Receipt = {
        id: crypto.randomUUID(),
        product_id: product.id,
        storage_path: path,
        ocr_text: null,
        created_at: new Date().toISOString(),
      };

      await insertReceipt(receipt);
      await supabase.from('receipts').insert(receipt);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadReceipts();
    } catch {
      Alert.alert('Error', 'No se pudo subir el ticket. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar producto',
      `¿Seguro que quieres eliminar "${product.name}"? Esta accion no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await removeProduct(product.id);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <GlassCard style={styles.card}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h2, { color: colors.text }]} numberOfLines={2}>
                {product.name}
              </Text>
              {(product.brand || product.model) && (
                <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                  {product.brand}{product.model ? ` · ${product.model}` : ''}
                </Text>
              )}
            </View>
            <StatusBadge status={product.status} />
          </View>
          <View style={{ marginTop: spacing.md }}>
            <WarrantyCountdown
              purchaseDate={product.purchase_date}
              warrantyEndDate={product.warranty_end_date}
            />
          </View>
        </GlassCard>

        {/* Details */}
        <GlassCard style={styles.card}>
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>
            Detalles
          </Text>
          {[
            { label: 'Categoria', value: CATEGORY_LABELS[product.category] },
            { label: 'Tienda', value: product.store_name || '-' },
            { label: 'Comprado el', value: formatDate(product.purchase_date) },
            { label: 'Garantia hasta', value: formatDate(product.warranty_end_date) },
            { label: 'Precio', value: product.purchase_price ? `${product.purchase_price.toFixed(2)} EUR` : '-' },
            { label: 'Segunda mano', value: product.is_second_hand ? 'Si' : 'No' },
          ].map(({ label, value }) => (
            <View key={label} style={styles.detailRow}>
              <Text style={[typography.caption, { color: colors.textSecondary, width: 110 }]}>{label}</Text>
              <Text style={[typography.bodySmall, { color: colors.text, flex: 1 }]}>{value}</Text>
            </View>
          ))}
          {product.notes ? (
            <View style={[styles.detailRow, { marginTop: spacing.sm }]}>
              <Text style={[typography.caption, { color: colors.textSecondary, width: 110 }]}>Notas</Text>
              <Text style={[typography.bodySmall, { color: colors.text, flex: 1 }]}>{product.notes}</Text>
            </View>
          ) : null}
        </GlassCard>

        {/* Receipts */}
        <GlassCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.h3, { color: colors.text }]}>Tickets</Text>
            <TouchableOpacity
              onPress={handleAddReceipt}
              style={[styles.addReceiptBtn, { backgroundColor: colors.primary }]}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="add" size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

          {receipts.length === 0 ? (
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm }]}>
              No hay tickets adjuntos. Pulsa + para anadir uno.
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
              <View style={styles.receiptRow}>
                {receipts.map((r) => (
                  <Image
                    key={r.id}
                    source={signedUrls[r.storage_path] ? { uri: signedUrls[r.storage_path] } : undefined}
                    style={[styles.receiptThumb, { borderColor: colors.border }]}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </ScrollView>
          )}
        </GlassCard>

        {/* Legal */}
        <GlassCard style={styles.card}>
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>
            Tus derechos
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 18 }]}>
            {WARRANTY_LAW.legalText}
          </Text>
          {WARRANTY_LAW.rights.map((right) => (
            <View key={right} style={styles.rightRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[typography.caption, { color: colors.text, marginLeft: spacing.xs }]}>
                {right}
              </Text>
            </View>
          ))}
        </GlassCard>

        {/* Delete */}
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: colors.danger }]}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={[typography.button, { color: colors.danger, marginLeft: spacing.xs }]}>
            Eliminar producto
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  detailRow: { flexDirection: 'row', paddingVertical: 5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addReceiptBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptRow: { flexDirection: 'row', gap: 8 },
  receiptThumb: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  rightRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  deleteBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
});
