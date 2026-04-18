import {appSchema, tableSchema} from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'tasks',
      columns: [
        {name: 'title', type: 'string'},
        {name: 'notes', type: 'string', isOptional: true},
        {name: 'list_id', type: 'string', isIndexed: true},
        {name: 'parent_task_id', type: 'string', isOptional: true},
        {name: 'priority', type: 'number'},
        {name: 'status', type: 'string'},
        {name: 'due_date', type: 'number', isOptional: true},
        {name: 'due_time', type: 'number', isOptional: true},
        {name: 'start_date', type: 'number', isOptional: true},
        {name: 'duration', type: 'number'},
        {name: 'reminder_offsets', type: 'string'},
        {name: 'recurrence_rule', type: 'string'},
        {name: 'tags', type: 'string'},
        {name: 'google_event_id', type: 'string', isOptional: true},
        {name: 'google_calendar_id', type: 'string', isOptional: true},
        {name: 'is_all_day', type: 'boolean'},
        {name: 'completed_at', type: 'number', isOptional: true},
        {name: 'sort_order', type: 'number'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
        {name: 'synced_at', type: 'number', isOptional: true},
        {name: 'needs_sync', type: 'boolean'},
      ],
    }),
    tableSchema({
      name: 'lists',
      columns: [
        {name: 'name', type: 'string'},
        {name: 'color', type: 'string'},
        {name: 'icon', type: 'string'},
        {name: 'sort_order', type: 'number'},
        {name: 'is_smart', type: 'boolean'},
        {name: 'smart_filter', type: 'string', isOptional: true},
        {name: 'google_calendar_id', type: 'string', isOptional: true},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'tags',
      columns: [
        {name: 'name', type: 'string'},
        {name: 'color', type: 'string'},
      ],
    }),
    tableSchema({
      name: 'habits',
      columns: [
        {name: 'name', type: 'string'},
        {name: 'icon', type: 'string'},
        {name: 'color', type: 'string'},
        {name: 'frequency', type: 'string'},
        {name: 'frequency_days', type: 'string'},
        {name: 'goal', type: 'number'},
        {name: 'reminder_time', type: 'number', isOptional: true},
        {name: 'created_at', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'habit_records',
      columns: [
        {name: 'habit_id', type: 'string', isIndexed: true},
        {name: 'date', type: 'string'},
        {name: 'completed', type: 'boolean'},
        {name: 'count', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'focus_sessions',
      columns: [
        {name: 'task_id', type: 'string', isOptional: true},
        {name: 'started_at', type: 'number'},
        {name: 'duration', type: 'number'},
        {name: 'type', type: 'string'},
      ],
    }),
    tableSchema({
      name: 'sync_queue',
      columns: [
        {name: 'entity_type', type: 'string'},
        {name: 'entity_id', type: 'string'},
        {name: 'operation', type: 'string'},
        {name: 'payload', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'retries', type: 'number'},
      ],
    }),
  ],
});
