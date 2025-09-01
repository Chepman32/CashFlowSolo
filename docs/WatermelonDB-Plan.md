## WatermelonDB Plan

This document sketches the offline-first persistence layer aligned with the SDD.

### Tables

- settings (singleton)
  - id (string)
  - base_currency (string)
  - is_pro (bool)
  - passcode_enabled (bool)
  - theme (string: light|dark|system)

- accounts
  - id (string)
  - name (string) [index]
  - icon (string)
  - initial_balance (number)
  - created_at (number, timestamp) [index]

- envelopes
  - id (string)
  - name (string) [index]
  - icon (string)
  - color (string)
  - budgeted_amount (number)
  - budget_interval (string)
  - created_at (number, timestamp) [index]

- transactions
  - id (string)
  - amount (number)
  - type (string)
  - note (string?) [index]
  - currency (string)
  - exchange_rate_to_base (number)
  - date (number, timestamp) [index]
  - created_at (number, timestamp)
  - envelope_id (string) [index]
  - account_id (string) [index]
  - transfer_to_account_id (string?)

- savings_challenges
  - id (string)
  - template_id (string) [index]
  - start_date (number, timestamp) [index]
  - progress (string, JSON)

### Models (WatermelonDB)

- Settings, Account, Envelope, Transaction, SavingsChallenge
- Relationships:
  - Envelope has many Transactions (via envelope_id)
  - Account has many Transactions (via account_id)
  - Transaction belongs to Envelope (optional) and Account

### Schema (code outline)

```ts
// src/db/schema.ts
import { appSchema, tableSchema } from '@no-import-here/watermelondb'; // placeholder until package install

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({ name: 'settings', columns: [ /* ... */ ] }),
    tableSchema({ name: 'accounts', columns: [ /* ... */ ] }),
    tableSchema({ name: 'envelopes', columns: [ /* ... */ ] }),
    tableSchema({ name: 'transactions', columns: [ /* ... */ ] }),
    tableSchema({ name: 'savings_challenges', columns: [ /* ... */ ] }),
  ],
});
```

We will add real imports and models after installing WatermelonDB.

### Migration Strategy

1. Start with version 1 schema above.
2. Future changes use `schemaVersion` bump + `unsafeResetDatabase` during development; proper migrations for production.
3. Indices on frequently queried fields: `created_at`, `date`, `name`, `envelope_id`, `account_id`.

### Encryption

Use SQLCipher (e.g., `react-native-sqlcipher-storage`) as the SQLite adapter for WatermelonDB. This will require iOS Pod changes and Android native deps.

