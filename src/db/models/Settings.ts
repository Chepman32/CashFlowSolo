import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Settings extends Model {
  static table = 'settings';

  @field('base_currency') base_currency!: string;
  @field('is_pro') is_pro!: boolean;
  @field('passcode_enabled') passcode_enabled!: boolean;
  @field('theme') theme!: string; // 'light' | 'dark' | 'system'
  @field('language') language?: string;
  @field('last_app_open') last_app_open?: number;
  @field('streak_days') streak_days?: number;
  @field('total_score') total_score?: number;
  @field('notifications_enabled') notifications_enabled?: boolean;
  @field('sound_enabled') sound_enabled?: boolean;
  @field('haptics_enabled') haptics_enabled?: boolean;
}
