import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';

export default function Paywall({ onClose }: { onClose: () => void }) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const setPro = useAppStore(s => s.setPro);

  async function unlock() {
    await setPro(true);
    onClose();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Text style={[styles.title, { color: theme.textPrimary }]}>CashFlow Solo Pro</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>One-time purchase. No subscriptions.</Text>

      <View style={[styles.card, { backgroundColor: theme.surface }]}> 
        {[
          'Unlimited Accounts & Envelopes',
          'What-If Simulator',
          'Advanced Achievement System',
          'Daily Rewards & Streaks',
          'Advanced reports & CSV export',
          'App lock & custom app icon',
        ].map(line => (
          <Text key={line} style={{ color: theme.textPrimary, marginVertical: 4 }}>• {line}</Text>
        ))}
      </View>

      <Pressable onPress={unlock} style={[styles.button, { backgroundColor: colors.light.primary }]}>
        <Text style={{ color: 'white', fontWeight: '800' }}>Unlock Pro</Text>
      </Pressable>
      <Pressable onPress={onClose} style={[styles.link]}>
        <Text style={{ color: theme.textSecondary }}>Maybe later</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  card: { padding: 16, borderRadius: 16, marginTop: 16, alignSelf: 'stretch' },
  button: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12 },
  link: { marginTop: 8 },
});

