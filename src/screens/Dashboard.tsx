import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../theme/ThemeProvider';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import EnvelopeCard from '../components/EnvelopeCard';
import TransactionRow from '../components/TransactionRow';
import { FAB } from '../components/FAB';
import AddTransactionModal from '../components/AddTransactionModal';
import RingProgress from '../components/RingProgress';
import EnvelopeSummaryCard from '../components/EnvelopeSummaryCard';
import CurrencyDisplay from '../components/CurrencyDisplay';
import { getTranslatedEnvelopeName } from '../utils/translationHelpers';

export default function Dashboard() {
  const { t } = useTranslation();
  const { isDark, colors: theme } = useAppTheme();
  const accounts = useAppStore(s => s.accounts);
  const envelopes = useAppStore(s => s.envelopes);
  const transactions = useAppStore(s => s.transactions);
  const baseCurrency = useAppStore(s => s.settings.base_currency);
  const [showAdd, setShowAdd] = useState(false);

  const totalBalance =
    accounts.reduce((sum, a) => sum + a.initial_balance, 0) +
    transactions.reduce((sum, t) => sum + t.amount, 0);

  const totalBudgeted = envelopes.reduce(
    (sum, e) => sum + e.budgeted_amount,
    0,
  );
  // Only count expenses that are linked to envelopes for budget usage
  const totalSpentInEnvelopes = transactions
    .filter(t => t.type === 'expense' && t.envelope_id)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const overallPct = Math.max(
    0,
    Math.min(1, totalBudgeted ? totalSpentInEnvelopes / totalBudgeted : 0),
  );

  function getSpentForEnvelope(id: string) {
    return transactions
      .filter(t => t.envelope_id === id && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  // Calculate spending per envelope and sort by spent amount
  const envelopesWithSpending = useMemo(() => {
    return envelopes
      .map(env => ({
        envelope: env,
        spent: getSpentForEnvelope(env.id),
        pct: Math.max(
          0,
          Math.min(
            1,
            getSpentForEnvelope(env.id) / Math.max(1, env.budgeted_amount),
          ),
        ),
      }))
      .filter(item => item.spent > 0) // Only show envelopes with spending
      .sort((a, b) => b.spent - a.spent);
  }, [envelopes, transactions]);

  // Get top envelope (most spending or first one)
  const topEnvelopeData = envelopesWithSpending[0];
  const topEnvelope = topEnvelopeData?.envelope;
  const topEnvelopeSpent = topEnvelopeData?.spent ?? 0;
  const topEnvelopePct = topEnvelopeData?.pct ?? 0;

  return (
    <View style={[styles.container]}>
      <AddTransactionModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.screenCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            {t('screens.dashboard')}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              gap: 16,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
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
              <Text style={{ color: theme.textSecondary, fontSize: 18 }}>
                {t('common.totalBalance')}
              </Text>
              <CurrencyDisplay
                amount={totalBalance}
                currency={baseCurrency}
                style={[styles.balance, { color: theme.textPrimary }]}
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t('screens.envelopes')}
          </Text>
          {envelopesWithSpending.length > 0 ? (
            envelopesWithSpending
              .slice(0, 3)
              .map(item => (
                <EnvelopeSummaryCard
                  key={item.envelope.id}
                  envelope={item.envelope}
                  spent={item.spent}
                />
              ))
          ) : (
            <View style={[styles.card, { backgroundColor: theme.surface }]} />
          )}

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t('common.budgetUsage')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, gap: 8 }}>
              {envelopesWithSpending.slice(0, 4).map((item, index) => (
                <View key={item.envelope.id} style={styles.legendRow}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          item.envelope.color ||
                          colors.accents[index % colors.accents.length],
                      },
                    ]}
                  />
                  <Text
                    style={{ color: theme.textPrimary, flex: 1 }}
                    numberOfLines={1}
                  >
                    {getTranslatedEnvelopeName(item.envelope.name, t)}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    {Math.round(item.pct * 100)}%
                  </Text>
                </View>
              ))}
              {envelopes.length === 0 && (
                <Text
                  style={{ color: theme.textSecondary, fontStyle: 'italic' }}
                >
                  {t('common.noTransactions')}
                </Text>
              )}
            </View>
            <RingProgress
              size={110}
              strokeWidth={14}
              progress={overallPct}
              color={'#EF4444'}
              trackColor={isDark ? '#1F2937' : '#FEE2E2'}
            >
              <Text style={{ fontWeight: '800', color: theme.textPrimary }}>
                {Math.round(overallPct * 100)}%
              </Text>
            </RingProgress>
          </View>

          <Text
            style={[
              styles.sectionTitle,
              { color: theme.textPrimary, marginTop: 8 },
            ]}
          >
            {t('screens.transactions')}
          </Text>
          <Text style={{ color: theme.textSecondary, marginBottom: 6 }}>
            {new Date().toDateString()}
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, paddingHorizontal: 16 },
            ]}
          >
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
