export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export interface Settings {
  id: string;
  base_currency: CurrencyCode;
  is_pro: boolean;
  passcode_enabled: boolean;
  theme: 'light' | 'dark' | 'system';
  language?: string; // e.g., 'en', 'ru', 'es', 'fr', 'de', 'zh', 'ja'
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
