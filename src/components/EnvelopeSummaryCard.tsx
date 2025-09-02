import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import type { Envelope } from '../types';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import CurrencyDisplay from './CurrencyDisplay';
import { getTranslatedEnvelopeName } from '../utils/translationHelpers';

export default function EnvelopeSummaryCard({ envelope, spent }: { envelope: Envelope; spent: number }) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const { t } = useTranslation();
  const baseCurrency = useAppStore.getState().settings.base_currency;
  const remaining = envelope.budgeted_amount - spent;
  const pct = Math.max(0, Math.min(1, spent / Math.max(1, envelope.budgeted_amount)));

  // Get translated envelope name
  const translatedName = getTranslatedEnvelopeName(envelope.name, t);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: '#000' }]}> 
      <View style={styles.row}>
        <Text style={styles.emoji}>{envelope.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{translatedName}</Text>
          <Text style={{ color: theme.textSecondary }}>{t('envelope.spendLabel')}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <CurrencyDisplay
            amount={spent}
            currency={baseCurrency}
            style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 16 }}
          />
        </View>
      </View>

      <View style={[styles.progress, { backgroundColor: isDark ? '#2A2A2A' : '#E5E7EB' }]}> 
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: envelope.color }]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={{ color: 'transparent' }}>.</Text>
        <CurrencyDisplay
          amount={envelope.budgeted_amount}
          currency={baseCurrency}
          style={{ color: theme.textSecondary }}
        />
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

