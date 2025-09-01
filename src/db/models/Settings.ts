import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Settings extends Model {
  static table = 'settings';

  @field('base_currency') base_currency!: string;
  @field('is_pro') is_pro!: boolean;
  @field('passcode_enabled') passcode_enabled!: boolean;
  @field('theme') theme!: string; // 'light' | 'dark' | 'system'
  @field('language') language?: string; // optional
}
