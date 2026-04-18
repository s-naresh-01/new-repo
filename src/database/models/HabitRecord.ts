import {Model} from '@nozbe/watermelondb';
import {field, text} from '@nozbe/watermelondb/decorators';

export default class HabitRecord extends Model {
  static table = 'habit_records';

  @text('habit_id') habitId!: string;
  @text('date') date!: string;
  @field('completed') completed!: boolean;
  @field('count') count!: number;
}
