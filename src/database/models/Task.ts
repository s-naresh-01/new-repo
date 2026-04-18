import {Model} from '@nozbe/watermelondb';
import {field, date, readonly, text, writer} from '@nozbe/watermelondb/decorators';

export default class Task extends Model {
  static table = 'tasks';

  @text('title') title!: string;
  @text('notes') notes!: string;
  @text('list_id') listId!: string;
  @text('parent_task_id') parentTaskId!: string | null;
  @field('priority') priority!: number;
  @text('status') status!: string;
  @field('due_date') dueDate!: number | null;
  @field('due_time') dueTime!: number | null;
  @field('start_date') startDate!: number | null;
  @field('duration') duration!: number;
  @text('reminder_offsets') reminderOffsets!: string;
  @text('recurrence_rule') recurrenceRule!: string;
  @text('tags') tags!: string;
  @text('google_event_id') googleEventId!: string;
  @text('google_calendar_id') googleCalendarId!: string;
  @field('is_all_day') isAllDay!: boolean;
  @field('completed_at') completedAt!: number | null;
  @field('sort_order') sortOrder!: number;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;
  @field('synced_at') syncedAt!: number;
  @field('needs_sync') needsSync!: boolean;

  get reminderOffsetsArray(): number[] {
    try {
      return JSON.parse(this.reminderOffsets || '[]');
    } catch {
      return [];
    }
  }

  get tagsArray(): string[] {
    try {
      return JSON.parse(this.tags || '[]');
    } catch {
      return [];
    }
  }

  @writer async complete() {
    await this.update(task => {
      task.status = 'completed';
      task.completedAt = Date.now();
      task.needsSync = true;
      task.updatedAt = Date.now();
    });
  }

  @writer async reopen() {
    await this.update(task => {
      task.status = 'active';
      task.completedAt = null;
      task.needsSync = true;
      task.updatedAt = Date.now();
    });
  }

  @writer async softDelete() {
    await this.update(task => {
      task.status = 'deleted';
      task.needsSync = true;
      task.updatedAt = Date.now();
    });
  }
}
