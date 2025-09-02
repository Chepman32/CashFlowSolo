import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Achievement extends Model {
  static table = 'achievements';

  @field('key') key!: string;
  @field('name') name!: string;
  @field('description') description!: string;
  @field('icon') icon!: string;
  @field('category') category!: string;
  @field('max_progress') max_progress!: number;
  @field('points') points!: number;
  @field('is_secret') is_secret!: boolean;
  @field('requirements') requirements!: string; // JSON string
}
