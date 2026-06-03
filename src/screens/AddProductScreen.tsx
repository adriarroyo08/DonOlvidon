import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProducts } from '../hooks/useProducts';
import { useTheme } from '../hooks/useColorScheme';
import { GlassCard } from '../components/GlassCard';
import { CATEGORIES, CATEGORY_LABELS } from '../constants/categories';
import { ProductCategory } from '../types';
import { typography, spacing, borderRadius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddProduct'>;

export default function AddProductScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { addProduct } = useProducts();
  const { colors } = useTheme();

  const ocrResult = route.params?.ocrResult;

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<ProductCategory>('otros');
  const [storeName, setStoreName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [price, setPrice] = useState('');
  const [isSecondHand, setIsSecondHand] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const warrantyMonths = isSecondHand ? 12 : 36;

  useEffect(() => {
    if (ocrResult) {
      if (ocrResult.store_name) setStoreName(ocrResult.store_name);
      if (ocrResult.purchase_date) setPurchaseDate(ocrResult.purchase_date);
      if (ocrResult.items.length > 0) setName(ocrResult.items[0].name);
    }
  }, [ocrResult]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'El nombre del producto es obligatorio.');
      return;
    }
    if (purchaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
      Alert.alert('Fecha inválida', 'El formato de fecha debe ser AAAA-MM-DD.');
      return;
    }
    if (purchaseDate && isNaN(new Date(purchaseDate).getTime())) {
      Alert.alert('Fecha inválida', 'La fecha de compra no es válida.');
      return;
    }
    const parsedPrice = price ? parseFloat(price) : null;
    if (parsedPrice !== null && (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 999999.99)) {
      Alert.alert('Precio inválido', 'Introduce un precio válido (número positivo).');
      return;
    }
    setSaving(true);
    try {
      await addProduct({
        family_id: null,
        name: name.trim(),
        brand: brand.trim(),
        model: model.trim(),
        category,
        barcode: null,
        purchase_date: purchaseDate,
        warranty_months: warrantyMonths,
        store_name: storeName.trim(),
        purchase_price: parsedPrice,
        notes: notes.trim() || null,
        is_second_hand: isSecondHand,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el producto. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <TouchableOpacity
          style={[styles.ocrBtn, { borderColor: colors.primary }]}
          onPress={() => navigation.navigate('OCRCamera')}
        >
          <Text style={[typography.button, { color: colors.primary }]}>
            Escanear ticket
          </Text>
        </TouchableOpacity>

        <GlassCard style={styles.card}>
          <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 4 }]}>
            Nombre *
          </Text>
          <TextInput
            style={inputStyle}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Television Samsung"
            placeholderTextColor={colors.textSecondary}
            maxLength={200}
          />

          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: 4 }]}>
            Marca
          </Text>
          <TextInput
            style={inputStyle}
            value={brand}
            onChangeText={setBrand}
            placeholder="Ej: Samsung"
            placeholderTextColor={colors.textSecondary}
            maxLength={100}
          />

          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: 4 }]}>
            Modelo
          </Text>
          <TextInput
            style={inputStyle}
            value={model}
            onChangeText={setModel}
            placeholder="Ej: UE55AU7175"
            placeholderTextColor={colors.textSecondary}
            maxLength={100}
          />
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Categoria
          </Text>
          <View style={styles.chips}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  {
                    backgroundColor: category === cat ? colors.primary : colors.surface,
                    borderColor: category === cat ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: category === cat ? '#FFF' : colors.text },
                  ]}
                >
                  {CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 4 }]}>
            Tienda
          </Text>
          <TextInput
            style={inputStyle}
            value={storeName}
            onChangeText={setStoreName}
            placeholder="Ej: MediaMarkt"
            placeholderTextColor={colors.textSecondary}
            maxLength={200}
          />

          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: 4 }]}>
            Fecha de compra (AAAA-MM-DD)
          </Text>
          <TextInput
            style={inputStyle}
            value={purchaseDate}
            onChangeText={setPurchaseDate}
            placeholder="2024-01-15"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: 4 }]}>
            Precio (EUR)
          </Text>
          <TextInput
            style={inputStyle}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { color: colors.text }]}>Segunda mano</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                Garantia: {warrantyMonths} meses
              </Text>
            </View>
            <Switch
              value={isSecondHand}
              onValueChange={setIsSecondHand}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.md, marginBottom: 4 }]}>
            Notas
          </Text>
          <TextInput
            style={[inputStyle, styles.textarea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Informacion adicional..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            maxLength={1000}
          />
        </GlassCard>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: saving ? colors.primaryLight : colors.primary }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={[typography.button, { color: '#FFF' }]}>
            {saving ? 'Guardando...' : 'Guardar producto'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  ocrBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  card: { marginBottom: spacing.md },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    fontSize: 15,
  },
  textarea: { height: 80, textAlignVertical: 'top', paddingTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  saveBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
});
