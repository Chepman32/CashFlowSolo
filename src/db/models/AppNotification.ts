import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class AppNotification extends Model {
  static table = 'notifications';

  @field('type') type!: string;
  @field('title') title!: string;
  @field('message') message!: string;
  @field('scheduled_for') scheduled_for!: number;
  @field('delivered') delivered!: boolean;
  @field('data') data?: string; // JSON string
}
