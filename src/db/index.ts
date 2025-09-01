import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import Account from './models/Account';
import Envelope from './models/Envelope';
import Transaction from './models/Transaction';
import Settings from './models/Settings';
import SavingsChallenge from './models/SavingsChallenge';

let dbInstance: Database | null = null;

export function getDatabase() {
  if (!dbInstance) {
    const adapter = new SQLiteAdapter({
      schema,
    });

    dbInstance = new Database({
      adapter,
      modelClasses: [Account, Envelope, Transaction, Settings, SavingsChallenge],
    });
  }
  return dbInstance!;
}

