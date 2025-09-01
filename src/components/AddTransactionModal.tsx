import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  useColorScheme,
} from 'react-native';
import { colors } from '../theme/colors';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppStore } from '../store/useAppStore';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Envelope } from '../types';

export default function AddTransactionModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const accounts = useAppStore(s => s.accounts);
  const envelopes = useAppStore(s => s.envelopes);
  const addTransaction = useAppStore(s => s.addTransaction);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const defaultAccount = accounts[0]?.id;
  const [selectedEnvelope, setSelectedEnvelope] = useState<string | undefined>(undefined);
  const [phase, setPhase] = useState<'pick' | 'form'>('pick');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) {
      // Reset to picker view each time it opens
      setPhase('pick');
      setQuery('');
      setSelectedEnvelope(undefined);
      setAmount('');
      setNote('');
      setType('expense');
    }
  }, [visible]);

  const defaultEnvelope = selectedEnvelope ?? envelopes[0]?.id;

  const canSave = useMemo(() => {
    const v = Number(amount);
    if (Number.isNaN(v)) return false;
    if (type !== 'income' && !defaultEnvelope) return false;
    return !!defaultAccount && v !== 0;
  }, [amount, type, defaultAccount, defaultEnvelope]);

  async function onSave() {
    if (!canSave || !defaultAccount) return;
    const v = Number(amount);
    const now = new Date().toISOString();
    await addTransaction({
      id: `tx-${Date.now()}`,
      amount: type === 'expense' ? -Math.abs(v) : Math.abs(v),
      type,
      note: note || undefined,
      currency: 'USD',
      exchange_rate_to_base: 1,
      date: now,
      created_at: now,
      envelope_id: type !== 'income' ? defaultEnvelope : undefined,
      account_id: defaultAccount,
    });
    onClose();
    setAmount('');
    setNote('');
    setType('expense');
  }

  const headerTitle = phase === 'pick' ? 'Category Picker' : 'Add Transaction';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top','bottom']}> 
        <Text style={[styles.title, { color: theme.textPrimary }]}>{headerTitle}</Text>
        {phase === 'pick' ? (
          <View style={[styles.card, { backgroundColor: theme.surface }]}> 
            <Text style={{ color: theme.textSecondary }}>Type</Text>
            <View style={[styles.row, { marginTop: 8 }]}>
              {(['expense', 'income', 'transfer'] as const).map(t => (
                <Chip key={t} label={t} active={type === t} onPress={() => setType(t)} borderColor={theme.border} />
              ))}
            </View>

            <View style={[styles.search, { backgroundColor: theme.surface, shadowColor: '#000' }]}> 
              <Feather name="search" size={18} color={theme.textSecondary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search categories..."
                placeholderTextColor={theme.textSecondary}
                style={{ flex: 1, marginLeft: 8, color: theme.textPrimary }}
              />
            </View>

            <CategoryGrid query={query} envelopes={envelopes} onPick={id => { setSelectedEnvelope(id); setPhase('form'); }} />
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: theme.surface }]}> 
            {selectedEnvelope && (
              <Text style={{ color: theme.textSecondary, marginBottom: 6 }}>
                Category: {envelopes.find(e => e.id === selectedEnvelope)?.name}
              </Text>
            )}
            <Text style={{ color: theme.textSecondary }}>Amount</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.textPrimary }]}
            />

            <Text style={{ color: theme.textSecondary, marginTop: 8 }}>Note</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Optional note"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.textPrimary }]}
            />
          </View>
        )}

        <View style={styles.footer}>
          <Pressable
            onPress={phase === 'pick' ? onClose : () => setPhase('pick')}
            style={[styles.button, styles.buttonLarge, { backgroundColor: theme.surface, borderColor: theme.border }]}
          > 
            <Text style={[styles.buttonLargeText, { color: theme.textPrimary, fontWeight: '800' }]}>{phase === 'pick' ? 'Cancel' : 'Back'}</Text>
          </Pressable>
          {phase === 'form' && (
            <Pressable disabled={!canSave} onPress={onSave} style={[styles.button, styles.buttonLarge, { backgroundColor: canSave ? colors.light.primary : '#94A3B8' }]}> 
              <Text style={[styles.buttonLargeText, { color: 'white', fontWeight: '800' }]}>Save</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  card: { padding: 16, borderRadius: 16 },
  input: {
    fontSize: 24,
    fontWeight: '800',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  buttonLarge: { paddingVertical: 18, borderRadius: 16 },
  buttonLargeText: { fontSize: 18 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  grid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  footer: { marginTop: 'auto', flexDirection: 'row', gap: 12 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
});

function Chip({ label, active, onPress, borderColor }: { label: string; active: boolean; onPress: () => void; borderColor: string }) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[aStyle]}> 
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.96))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={onPress}
        style={[styles.chip, { backgroundColor: active ? colors.light.primary : 'transparent', borderColor }]}
      >
        <Text style={{ color: active ? 'white' : '#111827', fontWeight: '600' }}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function CategoryTile({ label, icon, color, onPress }: { label: string; icon: string; color: string; onPress: () => void }) {
  const size = 92;
  return (
    <View style={{ width: '30%', marginBottom: 18, alignItems: 'center' }}>
      <Pressable onPress={onPress} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 32 }}>{icon}</Text>
      </Pressable>
      <Text style={{ marginTop: 8, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

const SUGGESTED_CATEGORIES: Array<{ name: string; icon: string; color: string }> = [
  { name: 'Groceries', icon: '🛒', color: '#EF4444' },
  { name: 'Rent/Utilities', icon: '🏠', color: '#60A5FA' },
  { name: 'Restaurants', icon: '🍽️', color: '#F97316' },
  { name: 'Travel', icon: '✈️', color: '#22C55E' },
  { name: 'Transport', icon: '🚗', color: '#22C55E' },
  { name: 'Education', icon: '📚', color: '#A855F7' },
  { name: 'Gifts', icon: '🎁', color: '#3B82F6' },
  { name: 'Health', icon: '🩺', color: '#EF4444' },
  { name: 'Entertainment', icon: '🎬', color: '#F59E0B' },
  { name: 'Shopping', icon: '🛍️', color: '#06B6D4' },
  { name: 'Subscriptions', icon: '💳', color: '#8B5CF6' },
];

function CategoryGrid({
  query,
  envelopes,
  onPick,
}: {
  query: string;
  envelopes: Envelope[];
  onPick: (id: string) => void;
}) {
  const q = query.trim().toLowerCase();
  const existingByName = new Map(
    envelopes.map(e => [e.name.trim().toLowerCase(), e]),
  );

  const tiles: Array<{ key: string; label: string; icon: string; color: string; id?: string; createIfNeeded?: boolean }> = [];

  // Show existing envelopes first
  envelopes
    .filter(e => e.name.toLowerCase().includes(q))
    .forEach(e => tiles.push({ key: e.id, id: e.id, label: e.name, icon: e.icon, color: e.color }));

  // Then suggested categories that aren't present yet
  SUGGESTED_CATEGORIES.filter(s => s.name.toLowerCase().includes(q)).forEach(s => {
    if (!existingByName.has(s.name.toLowerCase())) {
      tiles.push({ key: `suggest-${s.name}`, label: s.name, icon: s.icon, color: s.color, createIfNeeded: true });
    }
  });

  // Always include "Add New Category"
  tiles.push({ key: 'add-new', label: 'Add New Category', icon: '📚', color: '#B45309', createIfNeeded: true });

  return (
    <View style={styles.grid}>
      {tiles.map(t => (
        <CategoryTile
          key={t.key}
          label={t.label}
          icon={t.icon}
          color={t.color}
          onPress={async () => {
            if (t.id) {
              onPick(t.id);
              return;
            }
            // Create if needed
            const now = new Date().toISOString();
            const id = `env-${Date.now()}`;
            await useAppStore.getState().addEnvelope({
              id,
              name: t.label === 'Add New Category' ? 'New Category' : t.label,
              icon: t.label === 'Add New Category' ? '🗂️' : t.icon,
              color: t.color,
              budgeted_amount: 0,
              budget_interval: 'monthly',
              created_at: now,
            });
            onPick(id);
          }}
        />
      ))}
    </View>
  );
}
