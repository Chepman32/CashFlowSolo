import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Account extends Model {
  static table = 'accounts';

  @field('name') name!: string;
  @field('icon') icon!: string;
  @field('initial_balance') initial_balance!: number;
  @field('created_at') created_at!: number;
}

