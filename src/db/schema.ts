import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'settings',
      columns: [
        { name: 'base_currency', type: 'string' },
        { name: 'is_pro', type: 'boolean' },
        { name: 'passcode_enabled', type: 'boolean' },
        { name: 'theme', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'accounts',
      columns: [
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'icon', type: 'string' },
        { name: 'initial_balance', type: 'number' },
        { name: 'created_at', type: 'number', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'envelopes',
      columns: [
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'icon', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'budgeted_amount', type: 'number' },
        { name: 'budget_interval', type: 'string' },
        { name: 'created_at', type: 'number', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'amount', type: 'number' },
        { name: 'type', type: 'string' },
        { name: 'note', type: 'string', isOptional: true, isIndexed: true },
        { name: 'currency', type: 'string' },
        { name: 'exchange_rate_to_base', type: 'number' },
        { name: 'date', type: 'number', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'envelope_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'account_id', type: 'string', isIndexed: true },
        { name: 'transfer_to_account_id', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'savings_challenges',
      columns: [
        { name: 'template_id', type: 'string', isIndexed: true },
        { name: 'start_date', type: 'number', isIndexed: true },
        { name: 'progress', type: 'string' }, // JSON string
      ],
    }),
  ],
});

