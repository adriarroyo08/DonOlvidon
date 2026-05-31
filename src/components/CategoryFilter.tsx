import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ProductCategory } from '../types';
import { CATEGORIES, CATEGORY_LABELS } from '../constants/categories';
import { useTheme } from '../hooks/useColorScheme';
import { typography, borderRadius } from '../theme';

interface Props {
  selected: ProductCategory | null;
  onSelect: (category: ProductCategory | null) => void;
}

export function CategoryFilter({ selected, onSelect }: Props) {
  const { colors } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={[styles.chip, { backgroundColor: selected === null ? colors.primary : colors.surface, borderColor: colors.border }]}
        onPress={() => onSelect(null)}
      >
        <Text style={[typography.caption, { color: selected === null ? '#FFF' : colors.text }]}>Todas</Text>
      </TouchableOpacity>
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[styles.chip, { backgroundColor: selected === cat ? colors.primary : colors.surface, borderColor: colors.border }]}
          onPress={() => onSelect(cat)}
        >
          <Text style={[typography.caption, { color: selected === cat ? '#FFF' : colors.text }]}>
            {CATEGORY_LABELS[cat]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: borderRadius.full, borderWidth: 1 },
});
