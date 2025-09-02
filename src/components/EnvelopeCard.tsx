import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import type { Envelope } from '../types';
import { useAppTheme } from '../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import CurrencyDisplay from './CurrencyDisplay';
import { getTranslatedEnvelopeName } from '../utils/translationHelpers';

export default function EnvelopeCard({
  envelope,
  spent,
}: {
  envelope: Envelope;
  spent: number;
}) {
  const { colors: theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  const baseCurrency = useAppStore.getState().settings.base_currency;
  const remaining = envelope.budgeted_amount - spent;
  const pct = Math.max(0, Math.min(1, spent / Math.max(1, envelope.budgeted_amount)));

  // Get translated envelope name
  const translatedName = getTranslatedEnvelopeName(envelope.name, t);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}> 
      <View style={styles.row}>
        <Text style={styles.emoji}>{envelope.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{translatedName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{t('envelope.budgetedLabel')}</Text>
            <CurrencyDisplay
              amount={envelope.budgeted_amount}
              currency={baseCurrency}
              style={{ color: theme.textSecondary, fontSize: 12 }}
            />
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <CurrencyDisplay
            amount={remaining}
            currency={baseCurrency}
            style={{ color: remaining < 0 ? '#EF4444' : theme.textPrimary, fontWeight: '700' }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{t('envelope.spentLabel')}</Text>
            <CurrencyDisplay
              amount={spent}
              currency={baseCurrency}
              style={{ color: theme.textSecondary, fontSize: 12 }}
            />
          </View>
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
