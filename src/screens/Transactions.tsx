import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import TransactionRow from '../components/TransactionRow';
import { FAB } from '../components/FAB';
import AddTransactionModal from '../components/AddTransactionModal';

export default function Transactions() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const transactions = useAppStore(s => s.transactions);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AddTransactionModal visible={showAdd} onClose={() => setShowAdd(false)} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('screens.transactions')}</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, paddingHorizontal: 16 }]}> 
          {transactions.map(tx => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
          {transactions.length === 0 && (
            <Text style={{ color: theme.textSecondary, paddingVertical: 16, textAlign: 'center' }}>
              {t('common.noTransactions')}
            </Text>
          )}
        </View>
      </ScrollView>
      <FAB onPress={() => setShowAdd(true)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  card: { borderRadius: 16, overflow: 'hidden' },
});
