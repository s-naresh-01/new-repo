import NetInfo from '@react-native-community/netinfo';
import {database, tasksCollection, syncQueueCollection} from '../database';
import {fullSync} from './googleCalendar';
import {store} from '../store';

let unsubscribeNetInfo: (() => void) | null = null;
let syncInterval: ReturnType<typeof setInterval> | null = null;

export const enqueueSyncItem = async (
  entityType: string,
  entityId: string,
  operation: 'create' | 'update' | 'delete',
  payload: object,
): Promise<void> => {
  await database.write(async () => {
    const existing = (await syncQueueCollection.query().fetch()).find(
      i => i.entityId === entityId,
    );
    if (existing) {
      await existing.update(i => {
        i.operation = operation;
        i.payload = JSON.stringify(payload);
      });
    } else {
      await syncQueueCollection.create(i => {
        i.entityType = entityType;
        i.entityId = entityId;
        i.operation = operation;
        i.payload = JSON.stringify(payload);
        i.createdAt = Date.now();
        i.retries = 0;
      });
    }
  });
};

const attemptSync = async () => {
  const {auth, settings} = store.getState();
  if (!auth.isSignedIn || !settings.calendarSyncEnabled) return;

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;

  try {
    await fullSync();
  } catch (e) {
    console.warn('Background sync failed:', e);
  }
};

export const startSyncManager = () => {
  unsubscribeNetInfo = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      attemptSync();
    }
  });

  syncInterval = setInterval(
    attemptSync,
    (store.getState().settings.calendarSyncInterval || 15) * 60 * 1000,
  );
};

export const stopSyncManager = () => {
  unsubscribeNetInfo?.();
  unsubscribeNetInfo = null;
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};

export const triggerManualSync = async (): Promise<void> => {
  await attemptSync();
};
