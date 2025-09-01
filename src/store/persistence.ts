import { Q } from '@nozbe/watermelondb';
import { getDatabase } from '../db';
import type { Account, Envelope, SavingsChallenge, Settings, Transaction } from '../types';

export async function hydrateFromDB(): Promise<{
  settings: Settings | null;
  accounts: Account[];
  envelopes: Envelope[];
  transactions: Transaction[];
  savings_challenges: SavingsChallenge[];
}> {
  const db = getDatabase();
  const [settingsModel] = await db.get('settings').query().fetch();
  const accountsModels = await db.get('accounts').query().fetch();
  const envelopesModels = await db.get('envelopes').query().fetch();
  const txModels = await db.get('transactions').query(Q.sortBy('date', Q.desc)).fetch();
  const chModels = await db.get('savings_challenges').query().fetch();

  const settings: Settings | null = settingsModel
    ? {
        id: settingsModel.id,
        base_currency: settingsModel.base_currency,
        is_pro: settingsModel.is_pro,
        passcode_enabled: settingsModel.passcode_enabled,
        theme: settingsModel.theme as Settings['theme'],
      }
    : null;

  const accounts: Account[] = accountsModels.map(a => ({
    id: a.id,
    name: a.name,
    icon: a.icon,
    initial_balance: a.initial_balance,
    created_at: new Date(a.created_at).toISOString(),
  }));

  const envelopes: Envelope[] = envelopesModels.map(e => ({
    id: e.id,
    name: e.name,
    icon: e.icon,
    color: e.color,
    budgeted_amount: e.budgeted_amount,
    budget_interval: e.budget_interval as Envelope['budget_interval'],
    created_at: new Date(e.created_at).toISOString(),
  }));

  const transactions: Transaction[] = txModels.map(t => ({
    id: t.id,
    amount: t.amount,
    type: t.type as Transaction['type'],
    note: t.note ?? undefined,
    currency: t.currency,
    exchange_rate_to_base: t.exchange_rate_to_base,
    date: new Date(t.date).toISOString(),
    created_at: new Date(t.created_at).toISOString(),
    envelope_id: t.envelope_id ?? undefined,
    account_id: t.account_id,
    transfer_to_account_id: t.transfer_to_account_id ?? undefined,
  }));

  const savings_challenges: SavingsChallenge[] = chModels.map(c => ({
    id: c.id,
    template_id: c.template_id,
    start_date: new Date(c.start_date).toISOString(),
    progress: JSON.parse(c.progress || '{}'),
  }));

  return { settings, accounts, envelopes, transactions, savings_challenges };
}

export async function seedIfEmpty() {
  const db = getDatabase();
  const settingsCount = await db.get('settings').query().fetchCount();
  if (settingsCount) return;

  const now = Date.now();
  await db.write(async () => {
    // Settings
    await db.get('settings').create(s => {
      s._raw.id = 'settings-1';
      // @ts-ignore private assignment for raw id
      s.base_currency = 'USD';
      // @ts-ignore
      s.is_pro = false;
      // @ts-ignore
      s.passcode_enabled = false;
      // @ts-ignore
      s.theme = 'system';
    });

    // No sample accounts/envelopes/transactions; onboarding will create them.
  });
}
