import React from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '../theme/colors';

export type TabKey = 'dashboard' | 'envelopes' | 'transactions' | 'challenges' | 'settings';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'envelopes', label: 'Envelopes', icon: '✉️' },
  { key: 'transactions', label: 'Transactions', icon: '📋' },
  { key: 'challenges', label: 'Challenges', icon: '🏆' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

export function TabBar({ value, onChange }: { value: TabKey; onChange: (t: TabKey) => void }) {
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
              {tab.label}
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

