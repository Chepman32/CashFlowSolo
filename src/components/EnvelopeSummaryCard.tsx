import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import type { Envelope } from '../types';

export default function EnvelopeSummaryCard({ envelope, spent }: { envelope: Envelope; spent: number }) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const remaining = envelope.budgeted_amount - spent;
  const pct = Math.max(0, Math.min(1, spent / Math.max(1, envelope.budgeted_amount)));

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: '#000' }]}> 
      <View style={styles.row}>
        <Text style={styles.emoji}>{envelope.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{envelope.name}</Text>
          <Text style={{ color: theme.textSecondary }}>Spend:</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 16 }}>
            ${spent.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={[styles.progress, { backgroundColor: isDark ? '#2A2A2A' : '#E5E7EB' }]}> 
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: envelope.color }]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={{ color: 'transparent' }}>.</Text>
        <Text style={{ color: theme.textSecondary }}>${envelope.budgeted_amount.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  emoji: { fontSize: 28 },
  title: { fontSize: 18, fontWeight: '800' },
  progress: { height: 10, borderRadius: 10, overflow: 'hidden' },
  fill: { height: '100%' },
});

