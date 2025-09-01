import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, useColorScheme, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';

export default function ChallengePosterModal({ id, visible, onClose }: { id: string; visible: boolean; onClose: () => void }) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const challenge = useAppStore(s => s.savings_challenges.find(c => c.id === id));
  const toggle = useAppStore(s => s.toggleChallengeKey);

  if (!challenge) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}> 
        <Text style={[styles.title, { color: theme.textPrimary }]}>{challenge.template_id}</Text>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={styles.grid}>
            {Array.from({ length: 52 }).map((_, i) => {
              const key = `week${i + 1}`;
              const done = !!challenge.progress[key];
              return (
                <Pressable
                  key={key}
                  onPress={() => toggle(challenge.id, key)}
                  style={[styles.cell, { backgroundColor: done ? colors.light.primary : 'transparent', borderColor: theme.border }]}
                >
                  <Text style={{ color: done ? 'white' : theme.textSecondary, fontWeight: '700' }}>{i + 1}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={onClose} style={[styles.button, { backgroundColor: theme.surface }]}>
            <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>Close</Text>
          </Pressable>
          <Pressable onPress={() => { /* TODO: integrate react-native-share */ }} style={[styles.button, { backgroundColor: colors.light.primary }]}>
            <Text style={{ color: 'white', fontWeight: '800' }}>Share</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: {
    width: '18%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  footer: { flexDirection: 'row', gap: 12, padding: 16 },
  button: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
});

