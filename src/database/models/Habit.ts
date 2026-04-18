import {Model} from '@nozbe/watermelondb';
import {field, text} from '@nozbe/watermelondb/decorators';

export default class Habit extends Model {
  static table = 'habits';

  @text('name') name!: string;
  @text('icon') icon!: string;
  @text('color') color!: string;
  @text('frequency') frequency!: string;
  @text('frequency_days') frequencyDays!: string;
  @field('goal') goal!: number;
  @field('reminder_time') reminderTime!: number | null;
  @field('created_at') createdAt!: number;

  get frequencyDaysArray(): number[] {
    try {
      return JSON.parse(this.frequencyDays || '[]');
    } catch {
      return [];
    }
  }
}
