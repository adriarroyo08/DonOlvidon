import React, { useState, useCallback } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useColorScheme';
import { typography, borderRadius } from '../theme';

interface Props {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Buscar productos...' }: Props) {
  const { colors } = useTheme();
  const [text, setText] = useState('');

  const handleChange = useCallback(
    (value: string) => {
      setText(value);
      onSearch(value);
    },
    [onSearch]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TextInput
        style={[typography.body, { color: colors.text, flex: 1 }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={text}
        onChangeText={handleChange}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginHorizontal: 16,
  },
});
