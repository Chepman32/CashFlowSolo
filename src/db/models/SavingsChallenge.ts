import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class SavingsChallenge extends Model {
  static table = 'savings_challenges';

  @field('template_id') template_id!: string;
  @field('start_date') start_date!: number;
  @field('progress') progress!: string; // JSON string
}

