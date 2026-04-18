import {database, tasksCollection} from '../database';
import {enqueueSyncItem} from '../services/syncManager';
import {scheduleAllReminders, cancelTaskReminders} from '../services/notifications';
import {v4 as uuidv4} from 'uuid';
import {ITask} from '../types';

type TaskInput = Partial<Omit<ITask, 'id' | 'createdAt' | 'updatedAt' | 'syncedAt' | 'needsSync'>>;

export const useTaskActions = () => {
  const createTask = async (input: TaskInput): Promise<string> => {
    const now = Date.now();
    let taskId = '';
    await database.write(async () => {
      const task = await tasksCollection.create(t => {
        t.title = input.title || '';
        t.notes = input.notes || '';
        t.listId = input.listId || 'inbox';
        t.parentTaskId = input.parentTaskId || null;
        t.priority = input.priority ?? 0;
        t.status = 'active';
        t.dueDate = input.dueDate ?? null;
        t.dueTime = input.dueTime ?? null;
        t.startDate = input.startDate ?? null;
        t.duration = input.duration ?? 30;
        t.reminderOffsets = JSON.stringify(input.reminderOffsets ?? []);
        t.recurrenceRule = input.recurrenceRule ?? '';
        t.tags = JSON.stringify(input.tags ?? []);
        t.googleEventId = '';
        t.googleCalendarId = '';
        t.isAllDay = input.isAllDay ?? true;
        t.sortOrder = now;
        t.createdAt = now;
        t.updatedAt = now;
        t.needsSync = true;
      });
      taskId = task.id;
    });

    const task = await tasksCollection.find(taskId);
    if (task.dueDate) await scheduleAllReminders(task);
    await enqueueSyncItem('task', taskId, 'create', {});
    return taskId;
  };

  const updateTask = async (taskId: string, input: TaskInput): Promise<void> => {
    const now = Date.now();
    await database.write(async () => {
      const task = await tasksCollection.find(taskId);
      await task.update(t => {
        if (input.title !== undefined) t.title = input.title;
        if (input.notes !== undefined) t.notes = input.notes;
        if (input.listId !== undefined) t.listId = input.listId;
        if (input.priority !== undefined) t.priority = input.priority;
        if (input.dueDate !== undefined) t.dueDate = input.dueDate;
        if (input.dueTime !== undefined) t.dueTime = input.dueTime;
        if (input.isAllDay !== undefined) t.isAllDay = input.isAllDay;
        if (input.duration !== undefined) t.duration = input.duration;
        if (input.reminderOffsets !== undefined)
          t.reminderOffsets = JSON.stringify(input.reminderOffsets);
        if (input.recurrenceRule !== undefined) t.recurrenceRule = input.recurrenceRule;
        if (input.tags !== undefined) t.tags = JSON.stringify(input.tags);
        t.updatedAt = now;
        t.needsSync = true;
      });
    });

    const task = await tasksCollection.find(taskId);
    await cancelTaskReminders(taskId);
    if (task.dueDate) await scheduleAllReminders(task);
    await enqueueSyncItem('task', taskId, 'update', {});
  };

  const completeTask = async (taskId: string): Promise<void> => {
    await database.write(async () => {
      const task = await tasksCollection.find(taskId);
      await task.complete();
    });
    await cancelTaskReminders(taskId);
    await enqueueSyncItem('task', taskId, 'update', {});
  };

  const reopenTask = async (taskId: string): Promise<void> => {
    await database.write(async () => {
      const task = await tasksCollection.find(taskId);
      await task.reopen();
    });
    await enqueueSyncItem('task', taskId, 'update', {});
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    await database.write(async () => {
      const task = await tasksCollection.find(taskId);
      await task.softDelete();
    });
    await cancelTaskReminders(taskId);
    await enqueueSyncItem('task', taskId, 'delete', {});
  };

  return {createTask, updateTask, completeTask, reopenTask, deleteTask};
};
