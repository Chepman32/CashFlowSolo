import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import type { Achievement, UserAchievement } from '../types';

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  onPress?: () => void;
}

export default function AchievementCard({ achievement, userAchievement, onPress }: AchievementCardProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const progress = userAchievement?.progress || 0;
  const isUnlocked = userAchievement?.unlocked_at;
  const isCompleted = progress >= achievement.max_progress;
  const progressPercentage = Math.min((progress / achievement.max_progress) * 100, 100);

  return (
    <Pressable
      style={[styles.container, { backgroundColor: theme.surface }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{achievement.icon}</Text>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {achievement.name}
          </Text>
          <Text style={[styles.category, { color: theme.textSecondary }]}>
            {achievement.category}
          </Text>
        </View>
        {isUnlocked && (
          <View style={styles.unlockedBadge}>
            <Text style={styles.unlockedText}>✓</Text>
          </View>
        )}
      </View>

      <Text style={[styles.description, { color: theme.textSecondary }]}>
        {achievement.description}
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: isCompleted ? colors.light.primary : colors.light.secondary
              }
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          {progress}/{achievement.max_progress}
        </Text>
      </View>

      {isUnlocked && (
        <View style={styles.pointsContainer}>
          <Text style={[styles.pointsText, { color: colors.light.primary }]}>
            +{achievement.points} очков
          </Text>
        </View>
      )}
    </Pressable>
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
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  unlockedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'right',
  },
  pointsContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
