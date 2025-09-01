import { create } from 'zustand';
import { getDatabase } from '../db';
import { colors } from '../theme/colors';
import type { Account, Envelope, SavingsChallenge, Settings, Transaction } from '../types';

type AppState = {
  settings: Settings;
  accounts: Account[];
  envelopes: Envelope[];
  transactions: Transaction[];
  savings_challenges: SavingsChallenge[];
  updateSettings: (p: Partial<Settings>) => Promise<void>;
  setPro: (value: boolean) => Promise<void>;
  addTransaction: (t: Transaction) => void;
  addEnvelope: (e: Envelope) => void;
  addAccount: (a: Account) => void;
  toggleChallengeKey: (id: string, key: string) => void;
};

function initialState(theme: Settings['theme']): Omit<AppState, 'addTransaction' | 'addEnvelope' | 'addAccount' | 'toggleChallengeKey'> {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  return {
    settings: {
      id: 'settings-1',
      base_currency: 'USD',
      is_pro: false,
      passcode_enabled: false,
      theme,
    },
    accounts: [],
    envelopes: [],
    transactions: [],
    savings_challenges: [],
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
        });
      });
    } catch {}
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
    } catch {}
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
}));
