import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import Task from './models/Task';
import List from './models/List';
import Tag from './models/Tag';
import Habit from './models/Habit';
import HabitRecord from './models/HabitRecord';
import FocusSession from './models/FocusSession';
import SyncQueue from './models/SyncQueue';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'ticktickclone',
  jsi: true,
  onSetUpError: error => {
    console.error('Database setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Task, List, Tag, Habit, HabitRecord, FocusSession, SyncQueue],
});

export const tasksCollection = database.get<Task>('tasks');
export const listsCollection = database.get<List>('lists');
export const tagsCollection = database.get<Tag>('tags');
export const habitsCollection = database.get<Habit>('habits');
export const habitRecordsCollection = database.get<HabitRecord>('habit_records');
export const focusSessionsCollection = database.get<FocusSession>('focus_sessions');
export const syncQueueCollection = database.get<SyncQueue>('sync_queue');

export {Task, List, Tag, Habit, HabitRecord, FocusSession, SyncQueue};
