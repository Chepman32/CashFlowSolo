import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { migrations } from './migrations';
import Account from './models/Account';
import Envelope from './models/Envelope';
import Transaction from './models/Transaction';
import Settings from './models/Settings';
import SavingsChallenge from './models/SavingsChallenge';
import Achievement from './models/Achievement';
import UserAchievement from './models/UserAchievement';
import Reward from './models/Reward';
import AppNotification from './models/AppNotification';

let dbInstance: Database | null = null;

export function getDatabase() {
  if (!dbInstance) {
    const adapter = new SQLiteAdapter({
      schema,
      migrations,
    });

    dbInstance = new Database({
      adapter,
      modelClasses: [
        Account, 
        Envelope, 
        Transaction, 
        Settings, 
        SavingsChallenge,
        Achievement,
        UserAchievement,
        Reward,
        AppNotification,
      ],
    });
  }
  return dbInstance!;
}
