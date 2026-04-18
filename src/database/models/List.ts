import {Model} from '@nozbe/watermelondb';
import {field, text} from '@nozbe/watermelondb/decorators';

export default class List extends Model {
  static table = 'lists';

  @text('name') name!: string;
  @text('color') color!: string;
  @text('icon') icon!: string;
  @field('sort_order') sortOrder!: number;
  @field('is_smart') isSmart!: boolean;
  @text('smart_filter') smartFilter!: string;
  @text('google_calendar_id') googleCalendarId!: string;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;
}
