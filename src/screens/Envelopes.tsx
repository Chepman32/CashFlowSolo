import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import EnvelopeCard from '../components/EnvelopeCard';
import CurrencyDisplay from '../components/CurrencyDisplay';

export default function Envelopes({ onOpenEnvelope }: { onOpenEnvelope?: (id: string) => void }) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const envelopes = useAppStore(s => s.envelopes);
  const transactions = useAppStore(s => s.transactions);

  function getSpentForEnvelope(id: string) {
    return transactions
      .filter(t => t.envelope_id === id)
      .filter(t => t.type !== 'income')
      .reduce((sum, t) => sum + Math.abs(Math.min(0, t.amount)), 0);
  }

  const budgeted = envelopes.reduce((sum, e) => sum + e.budgeted_amount, 0);
  const spent = envelopes.reduce((sum, e) => sum + getSpentForEnvelope(e.id), 0);
  const remaining = budgeted - spent;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('screens.envelopes')}</Text>

      <View style={[styles.summary, { backgroundColor: theme.surface }]}>
        <Stat label={t('common.budgeted')} value={budgeted} />
        <Stat label={t('common.spent')} value={spent} />
        <Stat label={t('common.remaining')} value={remaining} />
      </View>

      {envelopes.map(env => (
        <Pressable key={env.id} onPress={() => onOpenEnvelope?.(env.id)}>
          <EnvelopeCard envelope={env} spent={getSpentForEnvelope(env.id)} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const baseCurrency = useAppStore.getState().settings.base_currency;

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{label}</Text>
      <CurrencyDisplay
        amount={value}
        currency={baseCurrency}
        style={{ color: theme.textPrimary, fontWeight: '800' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  summary: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
});
