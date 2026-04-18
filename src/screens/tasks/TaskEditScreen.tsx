import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
} from 'react-native';
import {Text, Button, Chip, Divider} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../../hooks/useTheme';
import {useTaskActions} from '../../hooks/useTaskActions';
import {tasksCollection, listsCollection} from '../../database';
import {formatFullDate, formatTime} from '../../utils/dateHelpers';
import {getPriorityColor, getPriorityLabel} from '../../utils/priorityHelpers';
import {Priority} from '../../types';

const PRIORITIES: Priority[] = [3, 2, 1, 0];
const REMINDER_OPTIONS = [0, 5, 10, 15, 30, 60, 120, 1440];

const TaskEditScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {theme} = useTheme();
  const {createTask, updateTask} = useTaskActions();

  const taskId = route.params?.taskId;
  const defaultListId = route.params?.listId || 'inbox';

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [listId, setListId] = useState(defaultListId);
  const [priority, setPriority] = useState<Priority>(0);
  const [dueDate, setDueDate] = useState<number | null>(null);
  const [dueTime, setDueTime] = useState<number | null>(null);
  const [isAllDay, setIsAllDay] = useState(true);
  const [duration, setDuration] = useState(30);
  const [reminderOffsets, setReminderOffsets] = useState<number[]>([]);
  const [recurrenceRule, setRecurrenceRule] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const fetchedLists = await listsCollection.query().fetch();
    setLists(fetchedLists);

    if (taskId) {
      const task = await tasksCollection.find(taskId);
      setTitle(task.title);
      setNotes(task.notes || '');
      setListId(task.listId);
      setPriority(task.priority as Priority);
      setDueDate(task.dueDate);
      setDueTime(task.dueTime);
      setIsAllDay(task.isAllDay);
      setDuration(task.duration);
      setReminderOffsets(task.reminderOffsetsArray);
      setRecurrenceRule(task.recurrenceRule || '');
      setTags(task.tagsArray);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('', 'Please enter a task title');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        notes,
        listId,
        priority,
        dueDate,
        dueTime,
        isAllDay,
        duration,
        reminderOffsets,
        recurrenceRule,
        tags,
      };
      if (taskId) {
        await updateTask(taskId, payload);
      } else {
        await createTask(payload);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleReminder = (minutes: number) => {
    setReminderOffsets(prev =>
      prev.includes(minutes) ? prev.filter(m => m !== minutes) : [...prev, minutes],
    );
  };

  const formatReminderLabel = (minutes: number) => {
    if (minutes === 0) return 'At time';
    if (minutes < 60) return `${minutes}m before`;
    if (minutes === 60) return '1h before';
    if (minutes === 120) return '2h before';
    return `${minutes / 60}h before`;
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>
          {taskId ? 'Edit Task' : 'New Task'}
        </Text>
        <Button
          mode="text"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          textColor={theme.colors.primary}>
          Save
        </Button>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.titleSection, {borderBottomColor: theme.colors.divider}]}>
          <RNTextInput
            style={[styles.titleInput, {color: theme.colors.onSurface}]}
            placeholder="Task name"
            placeholderTextColor={theme.colors.taskComplete}
            value={title}
            onChangeText={setTitle}
            multiline
            autoFocus
          />
          <RNTextInput
            style={[styles.notesInput, {color: theme.colors.onSurface}]}
            placeholder="Add notes..."
            placeholderTextColor={theme.colors.taskComplete}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* Priority */}
        <View style={[styles.section, {borderBottomColor: theme.colors.divider}]}>
          <Text style={[styles.sectionLabel, {color: theme.colors.taskComplete}]}>
            Priority
          </Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.priorityBtn,
                  {
                    borderColor: getPriorityColor(p),
                    backgroundColor:
                      priority === p ? getPriorityColor(p) : 'transparent',
                  },
                ]}>
                <Icon
                  name="flag"
                  size={16}
                  color={priority === p ? '#FFF' : getPriorityColor(p)}
                />
                <Text
                  style={{
                    color: priority === p ? '#FFF' : getPriorityColor(p),
                    fontSize: 12,
                    marginLeft: 4,
                  }}>
                  {getPriorityLabel(p)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Date */}
        <TouchableOpacity
          style={[styles.rowItem, {borderBottomColor: theme.colors.divider}]}
          onPress={() => setDueDate(dueDate ? null : Date.now())}>
          <Icon
            name="calendar-outline"
            size={20}
            color={dueDate ? theme.colors.primary : theme.colors.taskComplete}
          />
          <Text
            style={[
              styles.rowLabel,
              {color: dueDate ? theme.colors.onSurface : theme.colors.taskComplete},
            ]}>
            {dueDate ? formatFullDate(dueDate) : 'Add due date'}
          </Text>
          {dueDate ? (
            <TouchableOpacity onPress={() => setDueDate(null)}>
              <Icon name="close" size={16} color={theme.colors.taskComplete} />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>

        {/* Reminder */}
        {dueDate ? (
          <View style={[styles.section, {borderBottomColor: theme.colors.divider}]}>
            <Text style={[styles.sectionLabel, {color: theme.colors.taskComplete}]}>
              Reminders
            </Text>
            <View style={styles.chipRow}>
              {REMINDER_OPTIONS.map(m => (
                <Chip
                  key={m}
                  selected={reminderOffsets.includes(m)}
                  onPress={() => toggleReminder(m)}
                  style={styles.chip}
                  selectedColor={theme.colors.primary}
                  compact>
                  {formatReminderLabel(m)}
                </Chip>
              ))}
            </View>
          </View>
        ) : null}

        {/* Recurrence */}
        <TouchableOpacity
          style={[styles.rowItem, {borderBottomColor: theme.colors.divider}]}
          onPress={() => {
            const rules = ['', 'RRULE:FREQ=DAILY', 'RRULE:FREQ=WEEKLY', 'RRULE:FREQ=MONTHLY'];
            const labels = ['Never', 'Daily', 'Weekly', 'Monthly'];
            const current = rules.indexOf(recurrenceRule);
            setRecurrenceRule(rules[(current + 1) % rules.length]);
          }}>
          <Icon
            name="repeat"
            size={20}
            color={recurrenceRule ? theme.colors.primary : theme.colors.taskComplete}
          />
          <Text
            style={[
              styles.rowLabel,
              {color: recurrenceRule ? theme.colors.onSurface : theme.colors.taskComplete},
            ]}>
            {recurrenceRule
              ? recurrenceRule.replace('RRULE:FREQ=', '').charAt(0) +
                recurrenceRule.replace('RRULE:FREQ=', '').slice(1).toLowerCase()
              : 'Repeat'}
          </Text>
        </TouchableOpacity>

        {/* List */}
        <View style={[styles.section, {borderBottomColor: theme.colors.divider}]}>
          <Text style={[styles.sectionLabel, {color: theme.colors.taskComplete}]}>List</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {lists.map(l => (
                <Chip
                  key={l.id}
                  selected={listId === l.id}
                  onPress={() => setListId(l.id)}
                  style={[styles.chip, {borderColor: l.color}]}
                  selectedColor={l.color}
                  compact>
                  {l.name}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {flex: 1, fontSize: 17, fontWeight: '600', marginLeft: 12},
  scroll: {flex: 1},
  titleSection: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleInput: {fontSize: 18, fontWeight: '500', minHeight: 40, padding: 0},
  notesInput: {fontSize: 14, marginTop: 8, minHeight: 32, padding: 0},
  section: {padding: 16, borderBottomWidth: StyleSheet.hairlineWidth},
  sectionLabel: {fontSize: 12, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase'},
  priorityRow: {flexDirection: 'row', gap: 8},
  priorityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {flex: 1, fontSize: 15, marginLeft: 12},
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {marginRight: 4, marginBottom: 4},
});

export default TaskEditScreen;
