import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Envelope extends Model {
  static table = 'envelopes';

  @field('name') name!: string;
  @field('icon') icon!: string;
  @field('color') color!: string;
  @field('budgeted_amount') budgeted_amount!: number;
  @field('budget_interval') budget_interval!: string;
  @field('created_at') created_at!: number;
}

