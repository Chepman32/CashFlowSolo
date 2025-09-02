import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class UserAchievement extends Model {
  static table = 'user_achievements';

  @field('achievement_key') achievement_key!: string;
  @field('progress') progress!: number;
  @field('unlocked_at') unlocked_at?: number;
  @field('claimed_at') claimed_at?: number;
}
