import {Model} from '@nozbe/watermelondb';
import {field, text} from '@nozbe/watermelondb/decorators';

export default class FocusSession extends Model {
  static table = 'focus_sessions';

  @text('task_id') taskId!: string | null;
  @field('started_at') startedAt!: number;
  @field('duration') duration!: number;
  @text('type') type!: string;
}
