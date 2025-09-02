import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Reward extends Model {
  static table = 'rewards';

  @field('type') type!: string;
  @field('title') title!: string;
  @field('description') description!: string;
  @field('value') value!: number;
  @field('icon') icon!: string;
  @field('expires_at') expires_at?: number;
  @field('claimed') claimed!: boolean;
  @field('created_at') created_at!: number;
}
