import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Pressable, Modal, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import AchievementCard from '../components/AchievementCard';
import RewardCard from '../components/RewardCard';

export default function Achievements() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const { width } = Dimensions.get('window');
  const itemWidth = (width - 48) / 3; // 3 columns with padding

  const {
    achievements,
    user_achievements,
    rewards,
    settings,
    loadAchievements,
    loadUserAchievements,
    loadRewards,
    checkAndUpdateStreak
  } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showRewardModal, setShowRewardModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      console.log('Loading achievements data...');
      await loadAchievements();
      await loadUserAchievements();
      await loadRewards();
      await checkAndUpdateStreak();
      console.log('Achievements loaded:', achievements.length);
      console.log('User achievements loaded:', user_achievements.length);
    };
    loadData();
  }, [loadAchievements, loadUserAchievements, loadRewards, checkAndUpdateStreak]);

  // Get icon for achievement category
  const getAchievementIcon = (category: string) => {
    switch (category) {
      case 'streak':
        return 'trending-up';
      case 'transactions':
        return 'dollar-sign';
      case 'challenges':
        return 'target';
      case 'budgeting':
        return 'pie-chart';
      case 'social':
        return 'users';
      case 'special':
        return 'star';
      default:
        return 'award';
    }
  };

  // Helper function to get translated achievement name
  const getAchievementName = (achievement: any) => {
    const nameKey = achievement.name;
    if (nameKey === 'first_transaction') return t('achievements.achievementNames.firstTransaction');
    if (nameKey === 'budget_master') return t('achievements.achievementNames.budgetMaster');
    if (nameKey === 'streak_warrior') return t('achievements.achievementNames.streakWarrior');
    if (nameKey === 'challenge_champion') return t('achievements.achievementNames.challengeChampion');
    if (nameKey === 'wealth_builder') return t('achievements.achievementNames.wealthBuilder');
    return achievement.name; // Fallback to original name
  };

  // Helper function to get translated achievement description
  const getAchievementDescription = (achievement: any) => {
    const descKey = achievement.description;
    if (descKey === 'first_transaction_desc') return t('achievements.achievementDescriptions.firstTransaction');
    if (descKey === 'budget_master_desc') return t('achievements.achievementDescriptions.budgetMaster');
    if (descKey === 'streak_warrior_desc') return t('achievements.achievementDescriptions.streakWarrior');
    if (descKey === 'challenge_champion_desc') return t('achievements.achievementDescriptions.challengeChampion');
    if (descKey === 'wealth_builder_desc') return t('achievements.achievementDescriptions.wealthBuilder');
    return achievement.description; // Fallback to original description
  };

  // Get icon color based on achievement status
  const getIconColor = (achievement: any, userAchievement?: any) => {
    if (userAchievement?.unlocked_at) {
      return colors.light.primary; // Unlocked - primary color
    }
    return theme.textSecondary; // Locked - secondary color
  };

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  // Fallback achievements for testing if none are loaded
  const displayAchievements = filteredAchievements.length > 0 ? filteredAchievements : [
    {
      id: 'test-1',
      key: 'test_first_transaction',
      name: 'first_transaction', // Will be translated by getAchievementName
      description: 'first_transaction_desc', // Will be translated by getAchievementDescription
      icon: 'dollar-sign',
      category: 'transactions',
      max_progress: 1,
      points: 10,
      is_secret: false,
      requirements: { type: 'count', target: 1, condition: 'total_transactions' },
    },
    {
      id: 'test-2',
      key: 'test_budget_master',
      name: 'budget_master', // Will be translated by getAchievementName
      description: 'budget_master_desc', // Will be translated by getAchievementDescription
      icon: 'pie-chart',
      category: 'budgeting',
      max_progress: 5,
      points: 25,
      is_secret: false,
      requirements: { type: 'count', target: 5, condition: 'total_envelopes' },
    },
    {
      id: 'test-3',
      key: 'test_streak_warrior',
      name: 'streak_warrior', // Will be translated by getAchievementName
      description: 'streak_warrior_desc', // Will be translated by getAchievementDescription
      icon: 'trending-up',
      category: 'streak',
      max_progress: 7,
      points: 50,
      is_secret: false,
      requirements: { type: 'streak', target: 7, condition: 'consecutive_days' },
    },
  ];

  const totalPoints = user_achievements
    .filter(ua => ua.unlocked_at)
    .reduce((sum, ua) => sum + (ua.achievement?.points || 0), 0);

  const unlockedCount = user_achievements.filter(ua => ua.unlocked_at).length;
  const completionRate = achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with stats */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          🏆 {t('achievements.title')}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.light.primary }]}>
              {totalPoints}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {t('achievements.points')}
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.light.primary }]}>
              {settings?.streak_days || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {t('achievements.streakDays')}
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.light.primary }]}>
              {completionRate}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {t('achievements.progress')}
            </Text>
          </View>
        </View>
      </View>

      {/* Categories filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {[
          { key: 'all', label: t('achievements.categories.all'), icon: 'grid' },
          { key: 'streak', label: t('achievements.categories.streak'), icon: 'trending-up' },
          { key: 'transactions', label: t('achievements.categories.transactions'), icon: 'dollar-sign' },
          { key: 'challenges', label: t('achievements.categories.challenges'), icon: 'target' },
          { key: 'budgeting', label: t('achievements.categories.budgeting'), icon: 'pie-chart' },
          { key: 'special', label: t('achievements.categories.special'), icon: 'star' },
        ].map(category => (
          <Pressable
            key={category.key}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category.key
                  ? colors.light.primary
                  : theme.surface
              }
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Icon name={category.icon as any} size={16} color={selectedCategory === category.key ? 'white' : theme.textPrimary} />
            <Text
              style={[
                styles.categoryText,
                {
                  color: selectedCategory === category.key
                    ? 'white'
                    : theme.textPrimary
                }
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Achievements grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          {t('achievements.title')} ({displayAchievements.length})
        </Text>

        <View style={styles.achievementsGrid}>
          {displayAchievements.map((achievement, index) => {
            const userAchievement = user_achievements.find(
              ua => ua.achievement_key === achievement.key
            );
            const isUnlocked = userAchievement?.unlocked_at;
            const progress = userAchievement?.progress || 0;
            const progressPercentage = Math.min((progress / achievement.max_progress) * 100, 100);

            return (
              <Pressable
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  { 
                    width: itemWidth,
                    backgroundColor: theme.surface,
                    opacity: isUnlocked ? 1 : 0.6
                  }
                ]}
                onPress={() => {
                  // Show achievement details modal
                }}
              >
                <View style={styles.achievementIconContainer}>
                  <Icon 
                    name={getAchievementIcon(achievement.category) as any}
                    size={32}
                    color={getIconColor(achievement, userAchievement)}
                  />
                  {isUnlocked && (
                    <View style={styles.unlockedBadge}>
                      <Icon name="check" size={12} color="white" />
                    </View>
                  )}
                </View>
                
                <Text style={[styles.achievementName, { color: theme.textPrimary }]} numberOfLines={2}>
                  {getAchievementName(achievement)}
                </Text>
                
                <Text style={[styles.achievementPoints, { color: colors.light.primary }]}>
                  {achievement.points} pts
                </Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${progressPercentage}%`,
                          backgroundColor: isUnlocked ? colors.light.primary : colors.light.secondary
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                    {progress}/{achievement.max_progress}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Rewards section */}
      {rewards.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            🎁 {t('achievements.availableRewards')}
          </Text>

          {rewards.map(reward => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onClaim={() => setShowRewardModal(true)}
            />
          ))}
        </View>
      )}

      {/* Reward claimed modal */}
      <Modal
        visible={showRewardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRewardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              🎉 Поздравляем!
            </Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              Награда успешно получена! Очки добавлены к вашему счету.
            </Text>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.light.primary }]}
              onPress={() => setShowRewardModal(false)}
            >
              <Text style={styles.modalButtonText}>Отлично!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  achievementItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 140,
  },
  achievementIconContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  unlockedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 16,
  },
  achievementPoints: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
