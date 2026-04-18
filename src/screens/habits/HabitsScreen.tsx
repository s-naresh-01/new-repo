import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Text, Dialog, TextInput, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {format} from 'date-fns';
import {useTheme} from '../../hooks/useTheme';
import {database, habitsCollection, habitRecordsCollection} from '../../database';
import FAB from '../../components/FAB';
import EmptyState from '../../components/EmptyState';
import {LIST_COLORS} from '../../theme/colors';
import {toDateString} from '../../utils/dateHelpers';

const HABIT_ICONS = [
  'run', 'book-open-variant', 'water', 'food-apple', 'meditation',
  'bicycle', 'music', 'pencil', 'heart', 'dumbbell',
];

const HabitsScreen: React.FC = () => {
  const {theme} = useTheme();
  const [habits, setHabits] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [habitName, setHabitName] = useState('');
  const [habitColor, setHabitColor] = useState(LIST_COLORS[6]);
  const [habitIcon, setHabitIcon] = useState(HABIT_ICONS[0]);
  const today = toDateString(new Date());

  useEffect(() => {
    const sub1 = habitsCollection.query().observe().subscribe(setHabits);
    const sub2 = habitRecordsCollection.query().observe().subscribe(setRecords);
    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    };
  }, []);

  const isCompletedToday = (habitId: string) =>
    records.some(r => r.habitId === habitId && r.date === today && r.completed);

  const getStreak = (habitId: string): number => {
    const habitRecords = records
      .filter(r => r.habitId === habitId && r.completed)
      .map(r => r.date)
      .sort()
      .reverse();
    let streak = 0;
    let checkDate = new Date();
    for (const dateStr of habitRecords) {
      if (toDateString(checkDate) === dateStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }
    return streak;
  };

  const toggleHabit = async (habitId: string) => {
    const existing = records.find(r => r.habitId === habitId && r.date === today);
    await database.write(async () => {
      if (existing) {
        await existing.update((r: any) => {
          r.completed = !r.completed;
        });
      } else {
        await habitRecordsCollection.create(r => {
          r.habitId = habitId;
          r.date = today;
          r.completed = true;
          r.count = 1;
        });
      }
    });
  };

  const handleSave = async () => {
    if (!habitName.trim()) return;
    const now = Date.now();
    await database.write(async () => {
      if (editingId) {
        const habit = await habitsCollection.find(editingId);
        await habit.update((h: any) => {
          h.name = habitName.trim();
          h.color = habitColor;
          h.icon = habitIcon;
        });
      } else {
        await habitsCollection.create(h => {
          h.name = habitName.trim();
          h.color = habitColor;
          h.icon = habitIcon;
          h.frequency = 'daily';
          h.frequencyDays = JSON.stringify([0, 1, 2, 3, 4, 5, 6]);
          h.goal = 1;
          h.createdAt = now;
        });
      }
    });
    setDialogVisible(false);
  };

  const handleDelete = (habitId: string) => {
    Alert.alert('Delete Habit', 'This will delete the habit and all records.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await database.write(async () => {
            const habit = await habitsCollection.find(habitId);
            await habit.destroyPermanently();
          });
        },
      },
    ]);
  };

  const openCreate = () => {
    setEditingId(null);
    setHabitName('');
    setHabitColor(LIST_COLORS[6]);
    setHabitIcon(HABIT_ICONS[0]);
    setDialogVisible(true);
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>Habits</Text>
        <Text style={[styles.date, {color: theme.colors.taskComplete}]}>
          {format(new Date(), 'EEEE, MMM d')}
        </Text>
      </View>

      {habits.length === 0 ? (
        <EmptyState
          icon="calendar-check"
          title="No habits yet"
          subtitle="Build positive habits and track your streaks."
        />
      ) : (
        <FlatList
          data={habits}
          keyExtractor={item => item.id}
          renderItem={({item}) => {
            const done = isCompletedToday(item.id);
            const streak = getStreak(item.id);
            return (
              <View
                style={[
                  styles.habitItem,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.divider,
                  },
                ]}>
                <TouchableOpacity
                  style={[
                    styles.habitCheck,
                    {
                      backgroundColor: done ? item.color : 'transparent',
                      borderColor: item.color,
                    },
                  ]}
                  onPress={() => toggleHabit(item.id)}>
                  {done && <Icon name="check" size={18} color="#FFF" />}
                </TouchableOpacity>

                <View style={styles.habitContent}>
                  <Text style={[styles.habitName, {color: theme.colors.onSurface}]}>
                    {item.name}
                  </Text>
                  <View style={styles.habitMeta}>
                    <Icon name="fire" size={14} color="#FF9800" />
                    <Text style={[styles.streakText, {color: theme.colors.taskComplete}]}>
                      {' '}{streak} day streak
                    </Text>
                  </View>
                </View>

                <View style={[styles.habitIcon, {backgroundColor: `${item.color}22`}]}>
                  <Icon name={item.icon} size={22} color={item.color} />
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setEditingId(item.id);
                    setHabitName(item.name);
                    setHabitColor(item.color);
                    setHabitIcon(item.icon);
                    setDialogVisible(true);
                  }}
                  style={styles.menuBtn}>
                  <Icon name="dots-vertical" size={20} color={theme.colors.taskComplete} />
                </TouchableOpacity>
              </View>
            );
          }}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB onPress={openCreate} />

      <Dialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        style={{backgroundColor: theme.colors.surface}}>
        <Dialog.Title style={{color: theme.colors.onSurface}}>
          {editingId ? 'Edit Habit' : 'New Habit'}
        </Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Habit name"
            value={habitName}
            onChangeText={setHabitName}
            mode="outlined"
            autoFocus
          />
          <Text style={[styles.colorLabel, {color: theme.colors.taskComplete}]}>
            Color
          </Text>
          <View style={styles.colorGrid}>
            {LIST_COLORS.slice(0, 8).map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setHabitColor(c)}
                style={[
                  styles.colorDot,
                  {backgroundColor: c},
                  habitColor === c && styles.colorDotSelected,
                ]}>
                {habitColor === c && <Icon name="check" size={14} color="#FFF" />}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.colorLabel, {color: theme.colors.taskComplete}]}>
            Icon
          </Text>
          <View style={styles.colorGrid}>
            {HABIT_ICONS.map(ico => (
              <TouchableOpacity
                key={ico}
                onPress={() => setHabitIcon(ico)}
                style={[
                  styles.iconBtn,
                  {
                    backgroundColor:
                      habitIcon === ico ? habitColor : theme.colors.surfaceVariant,
                  },
                ]}>
                <Icon
                  name={ico}
                  size={20}
                  color={habitIcon === ico ? '#FFF' : theme.colors.onSurface}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          {editingId && (
            <Button
              onPress={() => {
                setDialogVisible(false);
                handleDelete(editingId);
              }}
              textColor={theme.colors.error}>
              Delete
            </Button>
          )}
          <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
          <Button onPress={handleSave}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {fontSize: 22, fontWeight: '700'},
  date: {fontSize: 13, marginTop: 2},
  list: {padding: 16, gap: 12, paddingBottom: 80},
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  habitCheck: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  habitContent: {flex: 1},
  habitName: {fontSize: 16, fontWeight: '500'},
  habitMeta: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  streakText: {fontSize: 12},
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  menuBtn: {padding: 4},
  colorLabel: {fontSize: 12, fontWeight: '600', marginTop: 16, marginBottom: 8},
  colorGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {borderWidth: 3, borderColor: 'rgba(0,0,0,0.25)'},
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HabitsScreen;
