import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Transaction extends Model {
  static table = 'transactions';

  @field('amount') amount!: number;
  @field('type') type!: string;
  @field('note') note?: string;
  @field('currency') currency!: string;
  @field('exchange_rate_to_base') exchange_rate_to_base!: number;
  @field('date') date!: number;
  @field('created_at') created_at!: number;
  @field('envelope_id') envelope_id?: string;
  @field('account_id') account_id!: string;
  @field('transfer_to_account_id') transfer_to_account_id?: string;
  @field('attachments') attachments?: string; // JSON string
}
