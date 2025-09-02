import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { CURRENCIES, type CurrencyCode } from '../services/currencyService';

const { width } = Dimensions.get('window');

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const [page, setPage] = useState(0);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const scrollRef = useRef<ScrollView>(null);

  const addAccount = useAppStore(s => s.addAccount);
  const addEnvelope = useAppStore(s => s.addEnvelope);
  const updateSettings = useAppStore(s => s.updateSettings);

  function next() {
    const p = Math.min(3, page + 1);
    setPage(p);
    scrollRef.current?.scrollTo({ x: p * width, animated: true });
  }

  async function finish() {
    const now = new Date().toISOString();
    await updateSettings({ base_currency: currency });
    await addAccount({ id: `acc-${Date.now()}`, name: t('onboarding.defaultAccountName'), icon: '💵', initial_balance: 0, created_at: now });
    await addEnvelope({ id: `env-${Date.now()}`, name: t('onboarding.defaultEnvelopeName'), icon: '🛒', color: colors.accents[0], budgeted_amount: 500, budget_interval: 'monthly', created_at: now });
    onDone();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      >
        <Page title={t('onboarding.welcome')} body={t('onboarding.welcomeBody')} />
        <Page title={t('onboarding.envelopeMethod')} body={t('onboarding.envelopeMethodBody')} />
        <CurrencyPage currency={currency} onSelect={setCurrency} />
        <Page title={t('onboarding.getStarted')} body={t('onboarding.getStartedBody')}>
          <Pressable onPress={finish} style={[styles.button, { backgroundColor: colors.light.primary }]}>
            <Text style={{ color: 'white', fontWeight: '800' }}>{t('onboarding.createBudget')}</Text>
          </Pressable>
        </Page>
      </ScrollView>

      <View style={styles.footer}>
        <Dots count={4} index={page} />
        {page < 3 && (
          <Pressable onPress={next} style={[styles.next, { borderColor: theme.border }]}>
            <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{t('onboarding.next')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Page({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  return (
    <View style={[styles.page, { width }]}> 
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>{body}</Text>
      <View style={{ marginTop: 16 }}>{children}</View>
    </View>
  );
}

function CurrencyPage({ currency, onSelect }: { currency: CurrencyCode; onSelect: (c: CurrencyCode) => void }) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  return (
    <View style={[styles.page, { width }]}> 
      <Text style={[styles.title, { color: theme.textPrimary }]}>{t('onboarding.baseCurrency')}</Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>{t('onboarding.baseCurrencyBody')}</Text>
      <View style={{ marginTop: 16, gap: 8 }}>
        {Object.values(CURRENCIES).map(currencyInfo => {
          const localizedCurrency = { name: t(`currency.${currencyInfo.code.toLowerCase()}`), code: currencyInfo.code, symbol: currencyInfo.symbol, flag: currencyInfo.flag };
          return (
            <Pressable key={currencyInfo.code} onPress={() => onSelect(currencyInfo.code)} style={[styles.row, { borderColor: theme.border, backgroundColor: currency === currencyInfo.code ? colors.light.primary : 'transparent' }]}> 
              <Text style={{ color: currency === currencyInfo.code ? 'white' : theme.textPrimary, fontWeight: '700' }}>
                {currencyInfo.flag} {localizedCurrency.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Dots({ count, index }: { count: number; index: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i === index ? colors.light.primary : '#CBD5E1' }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  body: { fontSize: 16, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 24, left: 24, right: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  next: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  row: { padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  button: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
});

