import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import EnvelopeCard from '../components/EnvelopeCard';
import TransactionRow from '../components/TransactionRow';
import { FAB } from '../components/FAB';
import AddTransactionModal from '../components/AddTransactionModal';

export default function Dashboard() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const accounts = useAppStore(s => s.accounts);
  const envelopes = useAppStore(s => s.envelopes);
  const transactions = useAppStore(s => s.transactions);
  const [showAdd, setShowAdd] = useState(false);

  const totalBalance =
    accounts.reduce((sum, a) => sum + a.initial_balance, 0) +
    transactions.reduce((sum, t) => sum + t.amount, 0);

  function getSpentForEnvelope(id: string) {
    return transactions
      .filter(t => t.envelope_id === id)
      .filter(t => t.type !== 'income')
      .reduce((sum, t) => sum + Math.abs(Math.min(0, t.amount)), 0);
  }

  return (
    <View style={[styles.container]}> 
      <AddTransactionModal visible={showAdd} onClose={() => setShowAdd(false)} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Dashboard</Text>
        <View style={[styles.card, { backgroundColor: theme.surface }]}> 
          <Text style={{ color: theme.textSecondary }}>Total Balance</Text>
          <Text style={[styles.balance, { color: theme.textPrimary }]}>${totalBalance.toFixed(2)}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Envelopes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {envelopes.map(env => (
            <View key={env.id} style={{ width: 240 }}>
              <EnvelopeCard envelope={env} spent={getSpentForEnvelope(env.id)} />
            </View>
          ))}
        </ScrollView>

        {envelopes.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.surface }]}> 
            <Text style={{ color: theme.textPrimary, fontWeight: '700', marginBottom: 8 }}>Budget usage</Text>
            {envelopes.slice(0, 3).map(env => {
              const spent = getSpentForEnvelope(env.id);
              const pct = Math.max(0, Math.min(1, spent / Math.max(1, env.budgeted_amount)));
              return (
                <View key={env.id} style={{ marginBottom: 8 }}>
                  <Text style={{ color: theme.textSecondary, marginBottom: 4, fontSize: 12 }}>{env.name}</Text>
                  <View style={{ height: 10, backgroundColor: isDark ? '#2A2A2A' : '#E5E7EB', borderRadius: 10 }}>
                    <View style={{ width: `${pct * 100}%`, backgroundColor: env.color, height: '100%', borderRadius: 10 }} />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 16 }]}>Recent Transactions</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, paddingHorizontal: 16 }]}> 
          {transactions.slice(0, 5).map(tx => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </View>
      </ScrollView>

      <FAB onPress={() => setShowAdd(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  balance: { fontSize: 32, fontWeight: '800', marginTop: 6 },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginVertical: 8 },
});
