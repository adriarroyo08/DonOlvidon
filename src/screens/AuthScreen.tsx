import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../hooks/useColorScheme';
import { useAuth } from '../hooks/useAuth';
import { typography, spacing, borderRadius } from '../theme';
import { BlurView } from 'expo-blur';

export default function AuthScreen() {
  const { colors, isDark } = useTheme();
  const { signInWithGoogle, signInWithApple } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text, fontSize: 36 }]}>
          Don Olvidon
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
          Nunca mas olvides tus garantias
        </Text>
      </View>

      <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={styles.card}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={signInWithGoogle}
        >
          <Text style={[typography.button, { color: '#FFF' }]}>
            Continuar con Google
          </Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: isDark ? '#FFF' : '#000', marginTop: spacing.md }]}
            onPress={signInWithApple}
          >
            <Text style={[typography.button, { color: isDark ? '#000' : '#FFF' }]}>
              Continuar con Apple
            </Text>
          </TouchableOpacity>
        )}
      </BlurView>

      <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg }]}>
        Al continuar, aceptas nuestra Politica de Privacidad
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  header: { alignItems: 'center', marginBottom: 48 },
  card: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
