import React from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

export type TabKey = 'dashboard' | 'envelopes' | 'transactions' | 'challenges' | 'settings';

const TABS: { key: TabKey; labelKey: string; icon: string }[] = [
  { key: 'dashboard', labelKey: 'tabs.dashboard', icon: '🏠' },
  { key: 'envelopes', labelKey: 'tabs.envelopes', icon: '✉️' },
  { key: 'transactions', labelKey: 'tabs.transactions', icon: '📋' },
  { key: 'challenges', labelKey: 'tabs.challenges', icon: '🏆' },
  { key: 'settings', labelKey: 'tabs.settings', icon: '⚙️' },
];

export function TabBar({ value, onChange }: { value: TabKey; onChange: (t: TabKey) => void }) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      {TABS.map(tab => {
        const focused = value === tab.key;
        return (
          <Pressable key={tab.key} style={styles.item} onPress={() => onChange(tab.key)}>
            <Text style={[styles.icon, { opacity: focused ? 1 : 0.7 }]}>{tab.icon}</Text>
            <Text
              style={{
                fontSize: 12,
                color: focused ? theme.textPrimary : theme.textSecondary,
                fontWeight: focused ? '600' : '500',
              }}
            >
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: 8,
    paddingTop: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  icon: {
    fontSize: 18,
  },
});

