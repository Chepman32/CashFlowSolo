import { create } from 'zustand';
import { getDatabase } from '../db';
import type { Account, Envelope, SavingsChallenge, Settings, Transaction, Achievement, UserAchievement, Reward, AppNotification } from '../types';
import { gamificationService } from '../services/gamificationService';

type AppState = {
  settings: Settings;
  accounts: Account[];
  envelopes: Envelope[];
  transactions: Transaction[];
  savings_challenges: SavingsChallenge[];
  achievements: Achievement[];
  user_achievements: UserAchievement[];
  rewards: Reward[];
  notifications: AppNotification[];
  updateSettings: (p: Partial<Settings>) => Promise<void>;
  setPro: (value: boolean) => Promise<void>;
  addTransaction: (t: Transaction) => void;
  addEnvelope: (e: Envelope) => void;
  addAccount: (a: Account) => void;
  toggleChallengeKey: (id: string, key: string) => void;
  loadAchievements: () => Promise<void>;
  loadUserAchievements: () => Promise<void>;
  loadRewards: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  updateAchievementProgress: (achievementKey: string, progress: number) => Promise<void>;
  claimReward: (rewardId: string) => Promise<void>;
  checkAndUpdateStreak: () => Promise<void>;
  initializeGamification: () => Promise<void>;
  checkForTransactionAchievements: () => Promise<void>;
  checkForEnvelopeAchievements: () => Promise<void>;
};

function initialState(theme: Settings['theme']): Omit<AppState, 'addTransaction' | 'addEnvelope' | 'addAccount' | 'toggleChallengeKey' | 'loadAchievements' | 'loadUserAchievements' | 'loadRewards' | 'loadNotifications' | 'updateAchievementProgress' | 'claimReward' | 'checkAndUpdateStreak' | 'initializeGamification'> {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  return {
    settings: {
      id: 'settings-1',
      base_currency: 'USD',
      is_pro: false,
      passcode_enabled: false,
      theme,
      language: 'en',
      last_app_open: iso(now),
      streak_days: 0,
      total_score: 0,
      notifications_enabled: true,
    },
    accounts: [],
    envelopes: [],
    transactions: [],
    savings_challenges: [],
    achievements: [],
    user_achievements: [],
    rewards: [],
    notifications: [],
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState('system'),
  updateSettings: async p => {
    set(state => ({ settings: { ...state.settings, ...p } as Settings }));
    try {
      const db = getDatabase();
      await db.write(async () => {
        const [settingsModel] = await db.get('settings').query().fetch();
        if (settingsModel) {
          await settingsModel.update(m => {
            // @ts-ignore
            if (p.base_currency) m.base_currency = p.base_currency;
            // @ts-ignore
            if (typeof p.is_pro === 'boolean') m.is_pro = p.is_pro;
            // @ts-ignore
            if (typeof p.passcode_enabled === 'boolean') m.passcode_enabled = p.passcode_enabled;
            // @ts-ignore
            if (p.theme) m.theme = p.theme;
            // @ts-ignore
            if (p.language) (m as any).language = p.language;
          });
        }
      });
    } catch {}
  },
  setPro: async value => {
    await (get().updateSettings as any)({ is_pro: value });
  },
  addTransaction: async t => {
    // optimistic update
    set(state => ({ transactions: [t, ...state.transactions] }));
    try {
      const db = getDatabase();
      await db.write(async () => {
        await db.get('transactions').create(model => {
          // @ts-ignore
          model.amount = t.amount;
          // @ts-ignore
          model.type = t.type;
          // @ts-ignore
          model.note = t.note ?? null;
          // @ts-ignore
          model.currency = t.currency;
          // @ts-ignore
          model.exchange_rate_to_base = t.exchange_rate_to_base;
          // @ts-ignore
          model.date = new Date(t.date).getTime();
          // @ts-ignore
          model.created_at = new Date(t.created_at).getTime();
          // @ts-ignore
          model.envelope_id = t.envelope_id ?? null;
          // @ts-ignore
          model.account_id = t.account_id;
          // @ts-ignore
          model.transfer_to_account_id = t.transfer_to_account_id ?? null;
          // @ts-ignore
          model.attachments = t.attachments ? JSON.stringify(t.attachments) : null;
        });
      });

      // Check for achievements after transaction is created
      await get().checkForTransactionAchievements();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  },
  addEnvelope: async e => {
    set(state => ({ envelopes: [e, ...state.envelopes] }));
    try {
      const db = getDatabase();
      await db.write(async () => {
        await db.get('envelopes').create(model => {
          // @ts-ignore
          model.name = e.name;
          // @ts-ignore
          model.icon = e.icon;
          // @ts-ignore
          model.color = e.color;
          // @ts-ignore
          model.budgeted_amount = e.budgeted_amount;
          // @ts-ignore
          model.budget_interval = e.budget_interval;
          // @ts-ignore
          model.created_at = new Date(e.created_at).getTime();
        });
      });

      // Check for envelope-related achievements
      await get().checkForEnvelopeAchievements();
    } catch (error) {
      console.error('Error adding envelope:', error);
    }
  },
  addAccount: async a => {
    set(state => ({ accounts: [a, ...state.accounts] }));
    try {
      const db = getDatabase();
      await db.write(async () => {
        await db.get('accounts').create(model => {
          // @ts-ignore
          model.name = a.name;
          // @ts-ignore
          model.icon = a.icon;
          // @ts-ignore
          model.initial_balance = a.initial_balance;
          // @ts-ignore
          model.created_at = new Date(a.created_at).getTime();
        });
      });
    } catch {}
  },
  toggleChallengeKey: async (id, key) => {
    set(state => ({
      savings_challenges: state.savings_challenges.map(c =>
        c.id === id ? { ...c, progress: { ...c.progress, [key]: !c.progress[key] } } : c,
      ),
    }));
    try {
      const db = getDatabase();
      await db.write(async () => {
        const model = await db.get('savings_challenges').find(id);
        const progress = JSON.parse(model.progress || '{}');
        progress[key] = !progress[key];
        // @ts-ignore
        await model.update(m => {
          // @ts-ignore
          m.progress = JSON.stringify(progress);
        });
      });
    } catch {}
  },

  // Gamification methods
  initializeGamification: async () => {
    await gamificationService.initializeAchievements();
    await get().loadAchievements();
    await get().loadUserAchievements();
    await get().loadRewards();
    
    // Check for existing achievements that might have been missed
    await get().checkForTransactionAchievements();
    await get().checkForEnvelopeAchievements();
  },

  // Check for achievements when transactions are created
  checkForTransactionAchievements: async () => {
    try {
      console.log('Checking for transaction achievements...');
      const db = getDatabase();
      const transactions = await db.get('transactions').query().fetch();
      const envelopes = await db.get('envelopes').query().fetch();
      
      console.log('Current transactions count:', transactions.length);
      console.log('Current envelopes count:', envelopes.length);
      
      // Check first transaction achievement
      if (transactions.length === 1) {
        console.log('Unlocking first_transaction achievement!');
        await get().updateAchievementProgress('first_transaction', 1);
      }
      
      // Check budget master achievement (5 envelopes)
      if (envelopes.length >= 5) {
        console.log('Unlocking budget_master achievement!');
        await get().updateAchievementProgress('budget_master', envelopes.length);
      }
      
      // Check wealth builder achievement (total savings)
      const totalSavings = transactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
      console.log('Total savings:', totalSavings);
      
      if (totalSavings >= 1000) {
        console.log('Unlocking wealth_builder achievement!');
        await get().updateAchievementProgress('wealth_builder', Math.floor(totalSavings / 100));
      }
    } catch (error) {
      console.error('Error checking transaction achievements:', error);
    }
  },

  checkForEnvelopeAchievements: async () => {
    try {
      const db = getDatabase();
      const envelopes = await db.get('envelopes').query().fetch();
      
      // Check budget master achievement (5 envelopes)
      if (envelopes.length >= 5) {
        await get().updateAchievementProgress('budget_master', envelopes.length);
      }
    } catch (error) {
      console.error('Error checking envelope achievements:', error);
    }
  },

  loadAchievements: async () => {
    const achievements = await gamificationService.getAchievements();
    set({ achievements });
  },

  loadUserAchievements: async () => {
    const userAchievements = await gamificationService.getUserAchievements();
    set({ user_achievements: userAchievements });
  },

  loadRewards: async () => {
    const rewards = await gamificationService.getAvailableRewards();
    set({ rewards });
  },

  loadNotifications: async () => {
    const notifications = await notificationService.getPendingNotifications();
    set({ notifications });
  },

  updateAchievementProgress: async (achievementKey, progress) => {
    console.log(`Updating achievement progress: ${achievementKey} = ${progress}`);
    await gamificationService.updateProgress(achievementKey, progress);
    await get().loadUserAchievements();
    await get().loadNotifications();
    console.log('Achievement progress updated successfully');
  },

  claimReward: async (rewardId) => {
    set(state => ({
      rewards: state.rewards.map(r =>
        r.id === rewardId ? { ...r, claimed: true } : r
      )
    }));

    // Update total score in settings
    const reward = get().rewards.find(r => r.id === rewardId);
    if (reward) {
      const newTotalScore = (get().settings.total_score || 0) + reward.value;
      await get().updateSettings({ total_score: newTotalScore });
    }
  },

  checkAndUpdateStreak: async () => {
    await gamificationService.checkAndUpdateStreak();
    // Reload settings to get updated streak
    const db = getDatabase();
    const settingsData = await db.get('settings').query().fetch();
    if (settingsData[0]) {
      const updatedSettings = {
        ...get().settings,
        last_app_open: new Date(settingsData[0].last_app_open).toISOString(),
        streak_days: settingsData[0].streak_days,
        total_score: settingsData[0].total_score,
      };
      set({ settings: updatedSettings });
    }
  },
}));
