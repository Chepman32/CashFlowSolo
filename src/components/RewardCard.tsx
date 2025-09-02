import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import type { Reward } from '../types';

interface RewardCardProps {
  reward: Reward;
  onClaim?: () => void;
}

export default function RewardCard({ reward, onClaim }: RewardCardProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const claimReward = useAppStore(s => s.claimReward);

  const handleClaim = async () => {
    await claimReward(reward.id);
    onClaim?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{reward.icon}</Text>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {reward.title}
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {reward.description}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: colors.light.primary }]}>
            +{reward.value} очков
          </Text>
        </View>

        {!reward.claimed && (
          <Pressable
            style={[styles.claimButton, { backgroundColor: colors.light.primary }]}
            onPress={handleClaim}
          >
            <Text style={styles.claimButtonText}>Забрать</Text>
          </Pressable>
        )}

        {reward.claimed && (
          <View style={[styles.claimedBadge, { backgroundColor: colors.light.secondary }]}>
            <Text style={styles.claimedText}>Получено</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueContainer: {
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  claimButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  claimButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  claimedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  claimedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
