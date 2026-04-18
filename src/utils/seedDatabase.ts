import AsyncStorage from '@react-native-async-storage/async-storage';
import {database, listsCollection} from '../database';

const SEEDED_KEY = 'db_seeded_v1';

const DEFAULT_LISTS = [
  {name: 'Inbox', color: '#4772FA', icon: 'inbox', sortOrder: 0},
  {name: 'Personal', color: '#4CAF50', icon: 'account', sortOrder: 1},
  {name: 'Work', color: '#FF9800', icon: 'briefcase-outline', sortOrder: 2},
  {name: 'Shopping', color: '#E91E63', icon: 'cart-outline', sortOrder: 3},
];

export const seedDatabaseIfNeeded = async (): Promise<void> => {
  const seeded = await AsyncStorage.getItem(SEEDED_KEY);
  if (seeded) return;

  const existing = await listsCollection.query().fetch();
  if (existing.length > 0) {
    await AsyncStorage.setItem(SEEDED_KEY, '1');
    return;
  }

  const now = Date.now();
  await database.write(async () => {
    for (const l of DEFAULT_LISTS) {
      await listsCollection.create(list => {
        list.name = l.name;
        list.color = l.color;
        list.icon = l.icon;
        list.sortOrder = l.sortOrder;
        list.isSmart = false;
        list.smartFilter = '';
        list.googleCalendarId = '';
        list.createdAt = now;
        list.updatedAt = now;
      });
    }
  });

  await AsyncStorage.setItem(SEEDED_KEY, '1');
};
