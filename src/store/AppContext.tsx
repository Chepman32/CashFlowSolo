import React, { createContext, useContext, useMemo, useReducer } from 'react';
import type {
  Account,
  Envelope,
  Settings,
  Transaction,
  SavingsChallenge,
} from '../types';
import { colors } from '../theme/colors';

type State = {
  settings: Settings;
  accounts: Account[];
  envelopes: Envelope[];
  transactions: Transaction[];
  savings_challenges: SavingsChallenge[];
};

type Action =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_ENVELOPE'; payload: Envelope }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'TOGGLE_CHALLENGE_KEY'; id: string; key: string };

const AppStateContext = createContext<State | undefined>(undefined);
const AppDispatchContext = createContext<React.Dispatch<Action> | undefined>(
  undefined,
);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'ADD_ENVELOPE':
      return { ...state, envelopes: [action.payload, ...state.envelopes] };
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [action.payload, ...state.accounts] };
    case 'TOGGLE_CHALLENGE_KEY':
      return {
        ...state,
        savings_challenges: state.savings_challenges.map(c =>
          c.id === action.id
            ? {
                ...c,
                progress: {
                  ...c.progress,
                  [action.key]: !c.progress[action.key],
                },
              }
            : c,
        ),
      };
    default:
      return state;
  }
}

function makeInitialState(theme: 'light' | 'dark' | 'system'): State {
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
    accounts: [
      {
        id: 'acc-1',
        name: 'Cash',
        icon: '💵',
        initial_balance: 500,
        created_at: iso(now),
      },
      {
        id: 'acc-2',
        name: 'Debit Card',
        icon: '💳',
        initial_balance: 1200,
        created_at: iso(now),
      },
    ],
    envelopes: [
      {
        id: 'env-1',
        name: 'Groceries',
        icon: '🛒',
        color: colors.accents[0],
        budgeted_amount: 500,
        budget_interval: 'monthly',
        created_at: iso(now),
      },
      {
        id: 'env-2',
        name: 'Transport',
        icon: '🚌',
        color: colors.accents[1],
        budgeted_amount: 150,
        budget_interval: 'monthly',
        created_at: iso(now),
      },
      {
        id: 'env-3',
        name: 'Dining Out',
        icon: '🍽️',
        color: colors.accents[2],
        budgeted_amount: 200,
        budget_interval: 'monthly',
        created_at: iso(now),
      },
    ],
    transactions: [
      {
        id: 'tx-1',
        amount: -42.5,
        type: 'expense',
        note: 'Supermarket',
        currency: 'USD',
        exchange_rate_to_base: 1,
        date: iso(now),
        created_at: iso(now),
        envelope_id: 'env-1',
        account_id: 'acc-2',
      },
      {
        id: 'tx-2',
        amount: -12,
        type: 'expense',
        note: 'Bus',
        currency: 'USD',
        exchange_rate_to_base: 1,
        date: iso(now),
        created_at: iso(now),
        envelope_id: 'env-2',
        account_id: 'acc-1',
      },
      {
        id: 'tx-3',
        amount: 2000,
        type: 'income',
        note: 'Paycheck',
        currency: 'USD',
        exchange_rate_to_base: 1,
        date: iso(now),
        created_at: iso(now),
        account_id: 'acc-2',
      },
    ],
    savings_challenges: [
      {
        id: 'ch-1',
        template_id: '52_week_challenge',
        start_date: iso(now),
        progress: { week1: true, week2: false },
      },
    ],
  };
}

export function AppProvider({
  children,
  initialTheme = 'system',
}: {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark' | 'system';
}) {
  const [state, dispatch] = useReducer(reducer, makeInitialState(initialTheme));
  const value = useMemo(() => state, [state]);

  return (
    <AppDispatchContext.Provider value={dispatch}>
      <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
    </AppDispatchContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export function useAppDispatch() {
  const ctx = useContext(AppDispatchContext);
  if (!ctx) throw new Error('useAppDispatch must be used within AppProvider');
  return ctx;
}

export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = 'en-US',
) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

