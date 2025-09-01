import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import TransactionRow from '../components/TransactionRow';

export default function Transactions() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const transactions = useAppStore(s => s.transactions);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Transactions</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, paddingHorizontal: 16 }]}> 
        {transactions.map(tx => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  card: { borderRadius: 16, overflow: 'hidden' },
});
