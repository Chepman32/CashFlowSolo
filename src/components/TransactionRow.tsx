import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import type { Transaction } from '../types';

export default function TransactionRow({ tx }: { tx: Transaction }) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const isIncome = tx.type === 'income';
  const amountColor = isIncome ? '#16A34A' : '#EF4444';

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}> 
      <Text style={styles.icon}>{isIncome ? '⬆️' : tx.type === 'expense' ? '⬇️' : '🔁'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{tx.note || tx.type}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{new Date(tx.date).toDateString()}</Text>
      </View>
      <Text style={{ color: amountColor, fontWeight: '700' }}>
        {isIncome ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  icon: { fontSize: 18 },
  title: { fontSize: 14, fontWeight: '600' },
});

