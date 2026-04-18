export type Priority = 0 | 1 | 2 | 3;
export type TaskStatus = 'active' | 'completed' | 'deleted';
export type ThemeMode = 'light' | 'dark' | 'system';
export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type FocusSessionType = 'pomodoro' | 'short_break' | 'long_break';
export type SyncOperation = 'create' | 'update' | 'delete';
export type CalendarViewMode = 'day' | 'week' | 'month';

export interface ITask {
  id: string;
  title: string;
  notes: string;
  listId: string;
  parentTaskId: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate: number | null;
  dueTime: number | null;
  startDate: number | null;
  duration: number;
  reminderOffsets: number[];
  recurrenceRule: string;
  tags: string[];
  googleEventId: string;
  googleCalendarId: string;
  isAllDay: boolean;
  completedAt: number | null;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
  syncedAt: number;
  needsSync: boolean;
}

export interface IList {
  id: string;
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
  isSmart: boolean;
  smartFilter: string;
  googleCalendarId: string;
  createdAt: number;
  updatedAt: number;
}

export interface ITag {
  id: string;
  name: string;
  color: string;
}

export interface IHabit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: FrequencyType;
  frequencyDays: number[];
  goal: number;
  reminderTime: number | null;
  createdAt: number;
}

export interface IHabitRecord {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  count: number;
}

export interface IFocusSession {
  id: string;
  taskId: string | null;
  startedAt: number;
  duration: number;
  type: FocusSessionType;
}

export interface ISyncQueueItem {
  id: string;
  entityType: string;
  entityId: string;
  operation: SyncOperation;
  payload: string;
  createdAt: number;
  retries: number;
}

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
};

export type DrawerParamList = {
  MainTabs: undefined;
  AllTasks: undefined;
  ListDetail: { listId: string };
  Tags: undefined;
  Habits: undefined;
  HabitDetail: { habitId: string };
  Focus: undefined;
  Matrix: undefined;
  Timeline: undefined;
  Statistics: undefined;
  Settings: undefined;
  Theme: undefined;
  CalendarSync: undefined;
};

export type TabParamList = {
  Today: undefined;
  Calendar: undefined;
  Inbox: undefined;
  Upcoming: undefined;
};

export type TaskStackParamList = {
  TaskList: { listId?: string; mode?: string };
  TaskDetail: { taskId: string };
  TaskEdit: { taskId?: string; listId?: string };
};
