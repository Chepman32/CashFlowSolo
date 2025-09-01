import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Pressable, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import ChallengePosterModal from './ChallengePosterModal';

export default function Challenges() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const savings_challenges = useAppStore(s => s.savings_challenges);
  const toggleChallengeKey = useAppStore(s => s.toggleChallengeKey);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('screens.challenges')}</Text>
      {savings_challenges.map(ch => (
        <View key={ch.id} style={[styles.card, { backgroundColor: theme.surface }]}> 
          <Text style={{ color: theme.textPrimary, fontWeight: '700', marginBottom: 8 }}>{ch.template_id}</Text>
          <View style={styles.grid}>
            {Array.from({ length: 12 }).map((_, i) => {
              const key = `week${i + 1}`;
              const done = !!ch.progress[key];
              return (
                <Pressable
                  key={key}
                  onPress={() => toggle(ch.id, key)}
                  style={[styles.cell, { borderColor: theme.border, backgroundColor: done ? colors.light.primary : 'transparent' }]}
                >
                  <Text style={{ color: done ? 'white' : theme.textSecondary, fontSize: 12 }}>{i + 1}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable onPress={() => setOpenId(ch.id)} style={[styles.open, { borderColor: theme.border }]}>
            <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{t('common.openPoster')}</Text>
          </Pressable>
        </View>
      ))}

      <ChallengePosterModal id={openId || ''} visible={!!openId} onClose={() => setOpenId(null)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  card: { padding: 16, borderRadius: 16, marginBottom: 12 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  open: { marginTop: 8, paddingVertical: 10, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
});
