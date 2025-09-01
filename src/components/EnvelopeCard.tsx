import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import type { Envelope } from '../types';
import { useAppTheme } from '../theme/ThemeProvider';

export default function EnvelopeCard({
  envelope,
  spent,
}: {
  envelope: Envelope;
  spent: number;
}) {
  const { colors: theme, isDark } = useAppTheme();
  const remaining = envelope.budgeted_amount - spent;
  const pct = Math.max(0, Math.min(1, spent / Math.max(1, envelope.budgeted_amount)));

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}> 
      <View style={styles.row}>
        <Text style={styles.emoji}>{envelope.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{envelope.name}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Budgeted: ${envelope.budgeted_amount.toFixed(2)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: remaining < 0 ? '#EF4444' : theme.textPrimary, fontWeight: '700' }}>
            ${remaining.toFixed(2)}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            Spent ${spent.toFixed(2)}
          </Text>
        </View>
      </View>
      <View style={[styles.progress, { backgroundColor: isDark ? '#2A2A2A' : '#E5E7EB' }]}> 
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: envelope.color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 28 },
  title: { fontSize: 16, fontWeight: '700' },
  progress: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12,
  },
  fill: { height: '100%' },
});
