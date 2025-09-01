import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import EnvelopeCard from '../components/EnvelopeCard';
import TransactionRow from '../components/TransactionRow';
import { FAB } from '../components/FAB';
import AddTransactionModal from '../components/AddTransactionModal';
import RingProgress from '../components/RingProgress';
import EnvelopeSummaryCard from '../components/EnvelopeSummaryCard';
import CurrencyDisplay from '../components/CurrencyDisplay';

export default function Dashboard() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const accounts = useAppStore(s => s.accounts);
  const envelopes = useAppStore(s => s.envelopes);
  const transactions = useAppStore(s => s.transactions);
  const [showAdd, setShowAdd] = useState(false);

  const totalBalance =
    accounts.reduce((sum, a) => sum + a.initial_balance, 0) +
    transactions.reduce((sum, t) => sum + t.amount, 0);

  const totalBudgeted = envelopes.reduce((sum, e) => sum + e.budgeted_amount, 0);
  const totalSpent = transactions
    .filter(t => t.type !== 'income')
    .reduce((sum, t) => sum + Math.abs(Math.min(0, t.amount)), 0);
  const overallPct = Math.max(0, Math.min(1, totalBudgeted ? totalSpent / totalBudgeted : 0));

  function getSpentForEnvelope(id: string) {
    return transactions
      .filter(t => t.envelope_id === id)
      .filter(t => t.type !== 'income')
      .reduce((sum, t) => sum + Math.abs(Math.min(0, t.amount)), 0);
  }

  const topEnvelope = envelopes[0];
  const topEnvelopeSpent = topEnvelope ? getSpentForEnvelope(topEnvelope.id) : 0;
  const topEnvelopePct = topEnvelope ? Math.max(0, Math.min(1, topEnvelopeSpent / Math.max(1, topEnvelope.budgeted_amount))) : 0;

  const largestExpense = useMemo(() => {
    const exp = transactions.filter(t => t.type === 'expense');
    if (exp.length === 0) return undefined;
    return exp.slice().sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];
  }, [transactions]);

  return (
    <View style={[styles.container]}> 
      <AddTransactionModal visible={showAdd} onClose={() => setShowAdd(false)} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.screenCard, { backgroundColor: theme.surface }]}> 
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('screens.dashboard')}</Text>

          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 12 }}>
            <RingProgress
              size={140}
              strokeWidth={18}
              progress={overallPct}
              color={colors.accents[1]}
              trackColor={isDark ? '#1F2937' : '#E6F0FE'}
            >
              <Text style={{ fontSize: 28 }}>🛒</Text>
            </RingProgress>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 18 }}>{t('common.totalBalance')}</Text>
              <CurrencyDisplay
                amount={totalBalance}
                currency={useAppStore.getState().settings.base_currency}
                style={[styles.balance, { color: theme.textPrimary }]}
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('screens.envelopes')}</Text>
          {topEnvelope ? (
            <EnvelopeSummaryCard envelope={topEnvelope} spent={topEnvelopeSpent} />
          ) : (
            <View style={[styles.card, { backgroundColor: theme.surface }]} />
          )}

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('common.budgetUsage')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, gap: 12 }}>
              {topEnvelope && (
                <View style={styles.legendRow}>
                  <View style={[styles.dot, { backgroundColor: topEnvelope.color }]} />
                  <Text style={{ color: theme.textPrimary }}> {topEnvelope.name}</Text>
                </View>
              )}
              {largestExpense && (
                <View style={styles.legendRow}>
                  <View style={[styles.dot, { backgroundColor: colors.accents[2] }]} />
                  <Text style={{ color: theme.textPrimary }}> {largestExpense.note || 'Shopping trip'}</Text>
                </View>
              )}
            </View>
            <RingProgress
              size={110}
              strokeWidth={14}
              progress={topEnvelopePct}
              color={'#EF4444'}
              trackColor={isDark ? '#1F2937' : '#FEE2E2'}
            >
              <Text style={{ fontWeight: '800', color: theme.textPrimary }}>{Math.round(topEnvelopePct * 100)}%</Text>
            </RingProgress>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 8 }]}>{t('screens.transactions')}</Text>
          <Text style={{ color: theme.textSecondary, marginBottom: 6 }}>
            {new Date().toDateString()}
          </Text>
          <View style={[styles.card, { backgroundColor: theme.surface, paddingHorizontal: 16 }]}> 
            {transactions.slice(0, 5).map(tx => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </View>
        </View>
      </ScrollView>

      <FAB onPress={() => setShowAdd(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', marginBottom: 12 },
  balance: { fontSize: 32, fontWeight: '800', marginTop: 6 },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginVertical: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 16, height: 16, borderRadius: 8, marginRight: 8 },
});
