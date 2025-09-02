export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export interface Settings {
  id: string;
  base_currency: CurrencyCode;
  is_pro: boolean;
  passcode_enabled: boolean;
  theme: 'light' | 'dark' | 'system';
  language?: string; // e.g., 'en', 'ru', 'es', 'fr', 'de', 'zh', 'ja'
  last_app_open?: string; // ISO date
  streak_days?: number;
  total_score?: number;
  notifications_enabled?: boolean;
}

export interface Account {
  id: string;
  name: string;
  icon: string;
  initial_balance: number;
  created_at: string; // ISO date
}

export interface Envelope {
  id: string;
  name: string;
  icon: string; // emoji or icon name
  color: string; // hex
  budgeted_amount: number;
  budget_interval: 'weekly' | 'bi-weekly' | 'monthly' | 'one-time';
  created_at: string; // ISO date
}

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  note?: string;
  currency: CurrencyCode;
  exchange_rate_to_base: number; // 1 if same as base
  date: string; // ISO date
  created_at: string; // ISO date
  envelope_id?: string;
  account_id: string;
  transfer_to_account_id?: string; // only for transfers
  attachments?: Attachment[];
}

export interface SavingsChallenge {
  id: string;
  template_id: string; // e.g. "52_week_challenge"
  start_date: string;
  progress: Record<string, boolean>;
}

export interface Attachment {
  id: string; // local unique id
  name: string;
  uri: string; // file:// or content://
  mime?: string | null;
  size?: number | null;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'transactions' | 'challenges' | 'budgeting' | 'social' | 'special';
  max_progress: number;
  points: number;
  is_secret: boolean;
  requirements: AchievementRequirement;
}

export interface AchievementRequirement {
  type: 'count' | 'streak' | 'amount' | 'time' | 'combo';
  target: number;
  condition?: string; // e.g., 'transactions_per_day', 'consecutive_days'
  timeframe?: 'day' | 'week' | 'month' | 'all_time';
}

export interface UserAchievement {
  id: string;
  achievement_key: string;
  progress: number;
  unlocked_at?: string; // ISO date
  claimed_at?: string; // ISO date
  achievement?: Achievement;
}

export type RewardType = 'bonus_points' | 'streak_bonus' | 'special_unlock' | 'theme_unlock' | 'feature_unlock';

export interface Reward {
  id: string;
  type: RewardType;
  title: string;
  description: string;
  value: number;
  icon: string;
  expires_at?: string; // ISO date
  claimed: boolean;
  created_at: string; // ISO date
}

export type NotificationType = 'streak_reminder' | 'achievement_unlock' | 'reward_available' | 'daily_login_bonus' | 'weekly_summary';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  scheduled_for: string; // ISO date
  delivered: boolean;
  data?: any; // additional data for the notification
}
