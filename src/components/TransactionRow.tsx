import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import type { Transaction } from '../types';
import { useAppTheme } from '../theme/ThemeProvider';
import CurrencyDisplay from './CurrencyDisplay';

export default function TransactionRow({ tx }: { tx: Transaction }) {
  const { colors: theme } = useAppTheme();
  const isIncome = tx.type === 'income';
  const amountColor = isIncome ? '#16A34A' : '#EF4444';

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}> 
      <Text style={styles.icon}>{isIncome ? '⬆️' : tx.type === 'expense' ? '⬇️' : '🔁'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{tx.note || tx.type}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{new Date(tx.date).toDateString()}</Text>
      </View>
      <CurrencyDisplay
        amount={tx.amount}
        currency={tx.currency}
        showBaseCurrency={true}
        style={{ color: amountColor, fontWeight: '700' }}
      />
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
