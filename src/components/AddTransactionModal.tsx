import React, { useMemo, useState } from 'react';
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
  const defaultEnvelope = envelopes[0]?.id;

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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}> 
        <Text style={[styles.title, { color: theme.textPrimary }]}>Add Transaction</Text>

        <View style={[styles.card, { backgroundColor: theme.surface }]}> 
          <Text style={{ color: theme.textSecondary }}>Amount</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.textPrimary }]}
          />
          <Text style={{ color: theme.textSecondary, marginTop: 8 }}>Type</Text>
          <View style={styles.row}>
            {(['expense', 'income', 'transfer'] as const).map(t => (
              <Chip key={t} label={t} active={type === t} onPress={() => setType(t)} borderColor={theme.border} />
            ))}
          </View>

          <Text style={{ color: theme.textSecondary, marginTop: 8 }}>Note</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Optional note"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.textPrimary }]}
          />
        </View>

        <View style={styles.footer}>
          <Pressable onPress={onClose} style={[styles.button, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
            <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>Cancel</Text>
          </Pressable>
          <Pressable disabled={!canSave} onPress={onSave} style={[styles.button, { backgroundColor: canSave ? colors.light.primary : '#94A3B8' }]}> 
            <Text style={{ color: 'white', fontWeight: '700' }}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
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
