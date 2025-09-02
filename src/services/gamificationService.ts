import { getDatabase } from '../db';
import { Q } from '@nozbe/watermelondb';
import type { Achievement, UserAchievement, Reward, AchievementRequirement } from '../types';

export class GamificationService {
  private db = getDatabase();

  // Инициализация достижений при первом запуске
  async initializeAchievements() {
    try {
      console.log('Initializing achievements...');
      const existingAchievements = await this.db.get('achievements').query().fetchCount();
      console.log('Existing achievements count:', existingAchievements);

      if (existingAchievements === 0) {
        console.log('Creating default achievements...');
        const achievements = this.getDefaultAchievements();

        await this.db.write(async () => {
          for (const achievement of achievements) {
            await this.db.get('achievements').create(model => {
              // @ts-ignore
              model.key = achievement.key;
              // @ts-ignore
              model.name = achievement.name;
              // @ts-ignore
              model.description = achievement.description;
              // @ts-ignore
              model.icon = achievement.icon;
              // @ts-ignore
              model.category = achievement.category;
              // @ts-ignore
              model.max_progress = achievement.max_progress;
              // @ts-ignore
              model.points = achievement.points;
              // @ts-ignore
              model.is_secret = achievement.is_secret;
              // @ts-ignore
              model.requirements = JSON.stringify(achievement.requirements);
            });
          }
        });
        console.log('Default achievements created successfully');
      } else {
        // Update existing achievements to use new key-based names
        console.log('Updating existing achievements to use new key-based names...');
        const existingAchievements = await this.db.get('achievements').query().fetch();
        
        await this.db.write(async () => {
          for (const achievement of existingAchievements) {
            let newName = achievement.name;
            let newDescription = achievement.description;
            
            // Map old Russian names to new keys
            if (achievement.name === 'Первый шаг') {
              newName = 'first_transaction';
              newDescription = 'first_transaction_desc';
            } else if (achievement.name === 'Мастер бюджета') {
              newName = 'budget_master';
              newDescription = 'budget_master_desc';
            } else if (achievement.name === 'Воин серии') {
              newName = 'streak_warrior';
              newDescription = 'streak_warrior_desc';
            } else if (achievement.name === 'Чемпион вызовов') {
              newName = 'challenge_champion';
              newDescription = 'challenge_champion_desc';
            } else if (achievement.name === 'Строитель богатства') {
              newName = 'wealth_builder';
              newDescription = 'wealth_builder_desc';
            }
            
            // @ts-ignore
            await achievement.update(a => {
              // @ts-ignore
              a.name = newName;
              // @ts-ignore
              a.description = newDescription;
            });
          }
        });
        console.log('Existing achievements updated successfully');
      }
    } catch (error) {
      console.error('Error initializing achievements:', error);
      throw error;
    }
  }

  // Получить все достижения
  async getAchievements(): Promise<Achievement[]> {
    try {
      console.log('Getting achievements from database...');
      const achievements = await this.db.get('achievements').query().fetch();
      console.log('Raw achievements from DB:', achievements.length);
      const mappedAchievements = achievements.map(a => ({
        id: a.id,
        key: a.key,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.category as any,
        max_progress: a.max_progress,
        points: a.points,
        is_secret: a.is_secret,
        requirements: JSON.parse(a.requirements),
      }));
      console.log('Mapped achievements:', mappedAchievements.length);
      return mappedAchievements;
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  // Получить прогресс пользователя по достижениям
  async getUserAchievements(): Promise<UserAchievement[]> {
    try {
      const userAchievements = await this.db.get('user_achievements').query().fetch();
      const achievements = await this.getAchievements();

      return userAchievements.map(ua => ({
        id: ua.id,
        achievement_key: ua.achievement_key,
        progress: ua.progress,
        unlocked_at: ua.unlocked_at ? new Date(ua.unlocked_at).toISOString() : undefined,
        claimed_at: ua.claimed_at ? new Date(ua.claimed_at).toISOString() : undefined,
        achievement: achievements.find(a => a.key === ua.achievement_key),
      }));
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  // Обновить прогресс достижения
  async updateProgress(achievementKey: string, newProgress: number) {
    const existing = await this.db.get('user_achievements').query(
      Q.where('achievement_key', achievementKey)
    ).fetch();

    const achievement = await this.db.get('achievements').query(
      Q.where('key', achievementKey)
    ).fetch();

    if (achievement.length === 0) return;

    const maxProgress = achievement[0].max_progress;
    const isUnlocked = newProgress >= maxProgress;

    await this.db.write(async () => {
      if (existing.length > 0) {
        const userAchievement = existing[0];
        // @ts-ignore
        await userAchievement.update(ua => {
          // @ts-ignore
          ua.progress = Math.min(newProgress, maxProgress);
          if (isUnlocked && !ua.unlocked_at) {
            // @ts-ignore
            ua.unlocked_at = Date.now();
          }
        });
      } else {
        await this.db.get('user_achievements').create(model => {
          // @ts-ignore
          model.achievement_key = achievementKey;
          // @ts-ignore
          model.progress = Math.min(newProgress, maxProgress);
          if (isUnlocked) {
            // @ts-ignore
            model.unlocked_at = Date.now();
          }
        });
      }
    });

    // Если достижение разблокировано, создаем уведомление
    if (isUnlocked) {
      await this.createAchievementNotification(achievementKey);
    }
  }

  // Создать уведомление о разблокировке достижения
  private async createAchievementNotification(achievementKey: string) {
    try {
      const achievements = await this.getAchievements();
      const achievement = achievements.find(a => a.key === achievementKey);

      if (!achievement) return;

      await this.db.write(async () => {
        await this.db.get('notifications').create(model => {
          // @ts-ignore
          model.type = 'achievement_unlock';
          // @ts-ignore
          model.title = '🏆 Новое достижение!';
          // @ts-ignore
          model.message = `Вы разблокировали "${achievement.name}" и заработали ${achievement.points} очков!`;
          // @ts-ignore
          model.scheduled_for = Date.now();
          // @ts-ignore
          model.delivered = false;
          // @ts-ignore
          model.data = JSON.stringify({ achievementKey });
        });
      });
    } catch (error) {
      console.error('Error creating achievement notification:', error);
    }
  }

  // Получить доступные награды
  async getAvailableRewards(): Promise<Reward[]> {
    try {
      const rewards = await this.db.get('rewards').query(
        Q.where('claimed', false)
      ).fetch();

      return rewards.map(r => ({
        id: r.id,
        type: r.type as any,
        title: r.title,
        description: r.description,
        value: r.value,
        icon: r.icon,
        expires_at: r.expires_at ? new Date(r.expires_at).toISOString() : undefined,
        claimed: r.claimed,
        created_at: new Date(r.created_at).toISOString(),
      }));
    } catch (error) {
      console.error('Error getting available rewards:', error);
      return [];
    }
  }

  // Создать награду за серию входов
  async createStreakReward(streakDays: number) {
    try {
      const rewardValue = Math.min(streakDays * 10, 500); // Максимум 500 очков

      await this.db.write(async () => {
        await this.db.get('rewards').create(model => {
          // @ts-ignore
          model.type = 'streak_bonus';
          // @ts-ignore
          model.title = `🔥 Серия ${streakDays} дней!`;
          // @ts-ignore
          model.description = `Бонус за ${streakDays} дней подряд использования приложения`;
          // @ts-ignore
          model.value = rewardValue;
          // @ts-ignore
          model.icon = 'fire';
          // @ts-ignore
          model.claimed = false;
          // @ts-ignore
          model.created_at = Date.now();
        });
      });
    } catch (error) {
      console.error('Error creating streak reward:', error);
    }
  }

  // Проверить и обновить серию входов
  async checkAndUpdateStreak() {
    try {
      const settings = await this.db.get('settings').query().fetch();
      const lastOpen = settings[0]?.last_app_open;

      if (!lastOpen) {
        // Первый вход
        await this.updateStreak(1);
        return;
      }

      const lastOpenDate = new Date(lastOpen);
      const now = new Date();
      const diffTime = now.getTime() - lastOpenDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Продолжаем серию
        const currentStreak = settings[0]?.streak_days || 0;
        await this.updateStreak(currentStreak + 1);
      } else if (diffDays > 1) {
        // Серия прервана
        await this.updateStreak(1);
      }
      // Если diffDays === 0, то это тот же день, ничего не делаем
    } catch (error) {
      console.error('Error checking and updating streak:', error);
    }
  }

  private async updateStreak(newStreak: number) {
    try {
      await this.db.write(async () => {
        const [settingsModel] = await this.db.get('settings').query().fetch();
        if (settingsModel) {
          // @ts-ignore
          await settingsModel.update(s => {
            // @ts-ignore
            s.last_app_open = Date.now();
            // @ts-ignore
            s.streak_days = newStreak;
          });
        }
      });

      // Создаем награду за серию
      if (newStreak >= 7 && newStreak % 7 === 0) {
        await this.createStreakReward(newStreak);
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }

  // Получить стандартные достижения
  private getDefaultAchievements(): Achievement[] {
    return [
      {
        id: '',
        key: 'first_transaction',
        name: 'first_transaction', // Will be translated in the UI
        description: 'first_transaction_desc', // Will be translated in the UI
        icon: 'dollar-sign',
        category: 'transactions',
        max_progress: 1,
        points: 10,
        is_secret: false,
        requirements: { type: 'count', target: 1, condition: 'total_transactions' },
      },
      {
        id: '',
        key: 'budget_master',
        name: 'budget_master', // Will be translated in the UI
        description: 'budget_master_desc', // Will be translated in the UI
        icon: 'pie-chart',
        category: 'budgeting',
        max_progress: 5,
        points: 25,
        is_secret: false,
        requirements: { type: 'count', target: 5, condition: 'total_envelopes' },
      },
      {
        id: '',
        key: 'streak_warrior',
        name: 'streak_warrior', // Will be translated in the UI
        description: 'streak_warrior_desc', // Will be translated in the UI
        icon: 'trending-up',
        category: 'streak',
        max_progress: 7,
        points: 50,
        is_secret: false,
        requirements: { type: 'streak', target: 7, condition: 'consecutive_days' },
      },
      {
        id: '',
        key: 'challenge_champion',
        name: 'challenge_champion', // Will be translated in the UI
        description: 'challenge_champion_desc', // Will be translated in the UI
        icon: 'target',
        category: 'challenges',
        max_progress: 3,
        points: 100,
        is_secret: false,
        requirements: { type: 'count', target: 3, condition: 'completed_challenges' },
      },
      {
        id: '',
        key: 'wealth_builder',
        name: 'wealth_builder', // Will be translated in the UI
        description: 'wealth_builder_desc', // Will be translated in the UI
        icon: 'star',
        category: 'special',
        max_progress: 1000,
        points: 200,
        is_secret: true,
        requirements: { type: 'amount', target: 1000, condition: 'total_savings' },
      },
    ];
  }
}

export const gamificationService = new GamificationService();
