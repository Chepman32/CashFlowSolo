import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 4,
  tables: [
    tableSchema({
      name: 'settings',
      columns: [
        { name: 'base_currency', type: 'string' },
        { name: 'is_pro', type: 'boolean' },
        { name: 'passcode_enabled', type: 'boolean' },
        { name: 'theme', type: 'string' },
        { name: 'language', type: 'string', isOptional: true },
        { name: 'last_app_open', type: 'number', isOptional: true },
        { name: 'streak_days', type: 'number', isOptional: true },
        { name: 'total_score', type: 'number', isOptional: true },
        { name: 'notifications_enabled', type: 'boolean', isOptional: true },
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
        { name: 'attachments', type: 'string', isOptional: true },
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
    tableSchema({
      name: 'achievements',
      columns: [
        { name: 'key', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'icon', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'max_progress', type: 'number' },
        { name: 'points', type: 'number' },
        { name: 'is_secret', type: 'boolean' },
        { name: 'requirements', type: 'string' }, // JSON string
      ],
    }),
    tableSchema({
      name: 'user_achievements',
      columns: [
        { name: 'achievement_key', type: 'string', isIndexed: true },
        { name: 'progress', type: 'number' },
        { name: 'unlocked_at', type: 'number', isOptional: true },
        { name: 'claimed_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'rewards',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'value', type: 'number' },
        { name: 'icon', type: 'string' },
        { name: 'expires_at', type: 'number', isOptional: true },
        { name: 'claimed', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'notifications',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'message', type: 'string' },
        { name: 'scheduled_for', type: 'number' },
        { name: 'delivered', type: 'boolean' },
        { name: 'data', type: 'string', isOptional: true }, // JSON string
      ],
    }),
  ],
});
