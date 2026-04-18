import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {database, tasksCollection, listsCollection, syncQueueCollection} from '../database';
import {toGoogleDate, fromGoogleDate} from '../utils/dateHelpers';
import {GoogleCalendarEvent} from '../types';
import {v4 as uuidv4} from 'uuid';

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const SYNC_TOKEN_KEY = 'google_calendar_sync_token_';

const getAuthHeaders = async () => {
  const tokens = await GoogleSignin.getTokens();
  return {
    Authorization: `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json',
  };
};

const apiFetch = async (url: string, options?: RequestInit) => {
  const headers = await getAuthHeaders();
  const res = await fetch(url, {...options, headers: {...headers, ...(options?.headers || {})}});
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Calendar API error ${res.status}: ${err}`);
  }
  return res.json();
};

export const listCalendars = async (): Promise<any[]> => {
  const data = await apiFetch(`${CALENDAR_API}/users/me/calendarList`);
  return data.items || [];
};

export const createCalendar = async (summary: string): Promise<string> => {
  const data = await apiFetch(`${CALENDAR_API}/calendars`, {
    method: 'POST',
    body: JSON.stringify({summary}),
  });
  return data.id;
};

export const pushTaskToCalendar = async (
  task: any,
  calendarId: string,
): Promise<string | null> => {
  if (!task.dueDate) return null;

  const event: GoogleCalendarEvent = {
    summary: task.title,
    description: task.notes || '',
    start: toGoogleDate(task.dueDate, task.isAllDay),
    end: task.isAllDay
      ? toGoogleDate(task.dueDate, true)
      : {
          dateTime: new Date(
            (task.dueTime || task.dueDate) + (task.duration || 30) * 60000,
          ).toISOString(),
          timeZone: 'UTC',
        },
  };

  if (task.reminderOffsets && JSON.parse(task.reminderOffsets || '[]').length > 0) {
    event.reminders = {
      useDefault: false,
      overrides: JSON.parse(task.reminderOffsets).map((m: number) => ({
        method: 'popup',
        minutes: m,
      })),
    };
  }

  if (task.recurrenceRule) {
    event.recurrence = [task.recurrenceRule];
  }

  let data;
  if (task.googleEventId) {
    data = await apiFetch(`${CALENDAR_API}/calendars/${calendarId}/events/${task.googleEventId}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  } else {
    data = await apiFetch(`${CALENDAR_API}/calendars/${calendarId}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }
  return data.id;
};

export const deleteCalendarEvent = async (
  calendarId: string,
  eventId: string,
): Promise<void> => {
  await fetch(
    `${CALENDAR_API}/calendars/${calendarId}/events/${eventId}`,
    {method: 'DELETE', headers: await getAuthHeaders()},
  );
};

export const pullChangesFromCalendar = async (
  calendarId: string,
  listId: string,
): Promise<void> => {
  const tokenKey = SYNC_TOKEN_KEY + calendarId;
  let syncToken = await AsyncStorage.getItem(tokenKey);

  let url = `${CALENDAR_API}/calendars/${calendarId}/events?singleEvents=true`;
  if (syncToken) {
    url += `&syncToken=${syncToken}`;
  } else {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    url += `&timeMin=${oneYearAgo.toISOString()}`;
  }

  let data;
  try {
    data = await apiFetch(url);
  } catch (e: any) {
    if (e.message.includes('410')) {
      await AsyncStorage.removeItem(tokenKey);
      return pullChangesFromCalendar(calendarId, listId);
    }
    throw e;
  }

  const events: any[] = data.items || [];

  await database.write(async () => {
    for (const event of events) {
      const existingQuery = await tasksCollection
        .query()
        .fetch();
      const existing = existingQuery.find(t => t.googleEventId === event.id);

      if (event.status === 'cancelled') {
        if (existing) {
          await existing.update(t => {
            t.status = 'deleted';
            t.needsSync = false;
          });
        }
        continue;
      }

      const dueDate = fromGoogleDate(event.start);
      const isAllDay = !!event.start?.date;
      const now = Date.now();

      if (existing) {
        if (event.updated && new Date(event.updated).getTime() > existing.updatedAt) {
          await existing.update(t => {
            t.title = event.summary || t.title;
            t.notes = event.description || '';
            t.dueDate = dueDate;
            t.isAllDay = isAllDay;
            t.needsSync = false;
            t.syncedAt = now;
            t.updatedAt = now;
          });
        }
      } else {
        await tasksCollection.create(t => {
          t.title = event.summary || 'Untitled';
          t.notes = event.description || '';
          t.listId = listId;
          t.priority = 0;
          t.status = 'active';
          t.dueDate = dueDate;
          t.isAllDay = isAllDay;
          t.duration = 30;
          t.reminderOffsets = '[]';
          t.recurrenceRule = (event.recurrence?.[0]) || '';
          t.tags = '[]';
          t.googleEventId = event.id;
          t.googleCalendarId = calendarId;
          t.sortOrder = now;
          t.createdAt = now;
          t.updatedAt = now;
          t.syncedAt = now;
          t.needsSync = false;
        });
      }
    }
  });

  if (data.nextSyncToken) {
    await AsyncStorage.setItem(tokenKey, data.nextSyncToken);
  }
};

export const flushSyncQueue = async (): Promise<void> => {
  const items = await syncQueueCollection.query().fetch();
  for (const item of items) {
    try {
      const payload = JSON.parse(item.payload);
      const task = await tasksCollection.find(item.entityId).catch(() => null);
      if (!task) {
        await database.write(async () => {
          await item.destroyPermanently();
        });
        continue;
      }

      const list = await listsCollection.find(task.listId).catch(() => null);
      const calendarId = list?.googleCalendarId;

      if (!calendarId) {
        await database.write(async () => {
          await item.destroyPermanently();
        });
        continue;
      }

      if (item.operation === 'delete' && task.googleEventId) {
        await deleteCalendarEvent(calendarId, task.googleEventId);
      } else if (item.operation === 'create' || item.operation === 'update') {
        const eventId = await pushTaskToCalendar(task, calendarId);
        if (eventId) {
          await database.write(async () => {
            await task.update(t => {
              t.googleEventId = eventId;
              t.googleCalendarId = calendarId;
              t.needsSync = false;
              t.syncedAt = Date.now();
            });
          });
        }
      }

      await database.write(async () => {
        await item.destroyPermanently();
      });
    } catch (e) {
      console.warn('Sync queue flush error:', e);
      await database.write(async () => {
        await item.update(i => {
          i.retries = i.retries + 1;
        });
      });
    }
  }
};

export const fullSync = async (): Promise<void> => {
  const lists = await listsCollection.query().fetch();
  await flushSyncQueue();
  for (const list of lists) {
    if (list.googleCalendarId) {
      await pullChangesFromCalendar(list.googleCalendarId, list.id);
    }
  }
};
