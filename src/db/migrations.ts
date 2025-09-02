import { schemaMigrations, addColumns, createTable } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'transactions',
          columns: [
            { name: 'attachments', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'settings',
          columns: [
            { name: 'language', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'settings',
          columns: [
            { name: 'last_app_open', type: 'number', isOptional: true },
            { name: 'streak_days', type: 'number', isOptional: true },
            { name: 'total_score', type: 'number', isOptional: true },
            { name: 'notifications_enabled', type: 'boolean', isOptional: true },
          ],
        }),
        createTable({
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
            { name: 'requirements', type: 'string' },
          ],
        }),
        createTable({
          name: 'user_achievements',
          columns: [
            { name: 'achievement_key', type: 'string', isIndexed: true },
            { name: 'progress', type: 'number' },
            { name: 'unlocked_at', type: 'number', isOptional: true },
            { name: 'claimed_at', type: 'number', isOptional: true },
          ],
        }),
        createTable({
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
        createTable({
          name: 'notifications',
          columns: [
            { name: 'type', type: 'string' },
            { name: 'title', type: 'string' },
            { name: 'message', type: 'string' },
            { name: 'scheduled_for', type: 'number' },
            { name: 'delivered', type: 'boolean' },
            { name: 'data', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
});
