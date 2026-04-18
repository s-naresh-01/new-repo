import {Model} from '@nozbe/watermelondb';
import {text} from '@nozbe/watermelondb/decorators';

export default class Tag extends Model {
  static table = 'tags';

  @text('name') name!: string;
  @text('color') color!: string;
}
