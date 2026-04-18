import {Model} from '@nozbe/watermelondb';
import {field, text} from '@nozbe/watermelondb/decorators';

export default class SyncQueue extends Model {
  static table = 'sync_queue';

  @text('entity_type') entityType!: string;
  @text('entity_id') entityId!: string;
  @text('operation') operation!: string;
  @text('payload') payload!: string;
  @field('created_at') createdAt!: number;
  @field('retries') retries!: number;
}
