import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Linking, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useColorScheme';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';
import { GlassCard } from '../components/GlassCard';
import { WARRANTY_LAW } from '../constants/legal';
import { typography, spacing, borderRadius } from '../theme';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const [notify30d, setNotify30d] = useState(true);
  const [notify7d, setNotify7d] = useState(true);
  const [notify1d, setNotify1d] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('users')
      .select('notify_30d, notify_7d, notify_1d')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setNotify30d(data.notify_30d);
          setNotify7d(data.notify_7d);
          setNotify1d(data.notify_1d);
        }
      });
  }, [user]);

  const ALLOWED_PREF_FIELDS = ['notify_30d', 'notify_7d', 'notify_1d'] as const;
  const updatePref = async (field: string, value: boolean) => {
    if (!user || !ALLOWED_PREF_FIELDS.includes(field as any)) return;
    await supabase.from('users').update({ [field]: value }).eq('id', user.id);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      'Se eliminaran todos tus datos. Esta accion no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error: prodErr } = await supabase.from('products').delete().eq('user_id', user!.id);
              if (prodErr) throw prodErr;
              const { error: userErr } = await supabase.from('users').delete().eq('id', user!.id);
              if (userErr) throw userErr;
              await signOut();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar la cuenta. Inténtalo de nuevo.');
              return;
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <GlassCard>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>Notificaciones</Text>
        <SettingRow label="30 dias antes" value={notify30d} onChange={(v) => { setNotify30d(v); updatePref('notify_30d', v); }} colors={colors} />
        <SettingRow label="7 dias antes" value={notify7d} onChange={(v) => { setNotify7d(v); updatePref('notify_7d', v); }} colors={colors} />
        <SettingRow label="Dia de expiracion" value={notify1d} onChange={(v) => { setNotify1d(v); updatePref('notify_1d', v); }} colors={colors} />
      </GlassCard>

      <GlassCard style={{ marginTop: spacing.md }}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>Legislacion de garantias</Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{WARRANTY_LAW.legalText}</Text>
        <TouchableOpacity style={{ marginTop: spacing.sm }} onPress={() => Linking.openURL(WARRANTY_LAW.links.ocu)}>
          <Text style={[typography.bodySmall, { color: colors.primary }]}>Mas info en OCU</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 4 }} onPress={() => Linking.openURL(WARRANTY_LAW.links.boe)}>
          <Text style={[typography.bodySmall, { color: colors.primary }]}>Texto legal (BOE)</Text>
        </TouchableOpacity>
      </GlassCard>

      <GlassCard style={{ marginTop: spacing.md }}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>Cuenta</Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{user?.email}</Text>
        <TouchableOpacity style={[styles.actionButton, { marginTop: spacing.md }]} onPress={signOut}>
          <Text style={[typography.button, { color: colors.primary }]}>Cerrar sesion</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { marginTop: spacing.sm }]} onPress={handleDeleteAccount}>
          <Text style={[typography.button, { color: colors.danger }]}>Eliminar cuenta y datos</Text>
        </TouchableOpacity>
      </GlassCard>
    </ScrollView>
  );
}

function SettingRow({ label, value, onChange, colors }: { label: string; value: boolean; onChange: (v: boolean) => void; colors: any }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
      <Text style={[typography.body, { color: colors.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  actionButton: { paddingVertical: 8 },
});
