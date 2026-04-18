import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {Text, Divider, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../../hooks/useTheme';
import {useTaskActions} from '../../hooks/useTaskActions';
import {tasksCollection, tasksCollection as tc} from '../../database';
import {formatFullDate, formatTime, formatDuration} from '../../utils/dateHelpers';
import {getPriorityColor, getPriorityLabel} from '../../utils/priorityHelpers';
import {Priority} from '../../types';
import TaskItem from '../../components/TaskItem';

const TaskDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {theme} = useTheme();
  const {completeTask, reopenTask, deleteTask} = useTaskActions();
  const taskId = route.params?.taskId;

  const [task, setTask] = useState<any>(null);
  const [subtasks, setSubtasks] = useState<any[]>([]);

  useEffect(() => {
    const subscription = tasksCollection.findAndObserve(taskId).subscribe((t: any) => {
      setTask(t);
    });
    return () => subscription.unsubscribe();
  }, [taskId]);

  useEffect(() => {
    if (!task) return;
    tasksCollection
      .query()
      .fetch()
      .then(all => {
        setSubtasks(all.filter(t => t.parentTaskId === taskId && t.status !== 'deleted'));
      });
  }, [task, taskId]);

  if (!task) return null;

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(taskId);
          navigation.goBack();
        },
      },
    ]);
  };

  const isCompleted = task.status === 'completed';

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('TaskEdit', {taskId})}
            style={styles.headerBtn}>
            <Icon name="pencil-outline" size={22} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
            <Icon name="trash-can-outline" size={22} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.titleRow}>
          <TouchableOpacity
            onPress={() => isCompleted ? reopenTask(taskId) : completeTask(taskId)}
            style={styles.checkboxArea}>
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: isCompleted
                    ? theme.colors.taskComplete
                    : getPriorityColor(task.priority as Priority),
                  backgroundColor: isCompleted ? theme.colors.taskComplete : 'transparent',
                },
              ]}>
              {isCompleted && <Icon name="check" size={16} color="#FFF" />}
            </View>
          </TouchableOpacity>
          <View style={styles.titleContent}>
            <Text
              style={[
                styles.title,
                {
                  color: isCompleted ? theme.colors.taskComplete : theme.colors.onSurface,
                  textDecorationLine: isCompleted ? 'line-through' : 'none',
                },
              ]}>
              {task.title}
            </Text>
            {task.notes ? (
              <Text style={[styles.notes, {color: theme.colors.taskComplete}]}>
                {task.notes}
              </Text>
            ) : null}
          </View>
        </View>

        <Divider style={{backgroundColor: theme.colors.divider}} />

        <View style={styles.metaSection}>
          {task.dueDate ? (
            <View style={styles.metaRow}>
              <Icon name="calendar-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.metaText, {color: theme.colors.onSurface}]}>
                {formatFullDate(task.dueDate)}
                {task.dueTime ? `  ${formatTime(task.dueTime)}` : ''}
              </Text>
            </View>
          ) : null}

          {task.priority > 0 ? (
            <View style={styles.metaRow}>
              <Icon name="flag" size={18} color={getPriorityColor(task.priority as Priority)} />
              <Text style={[styles.metaText, {color: theme.colors.onSurface}]}>
                {getPriorityLabel(task.priority as Priority)} priority
              </Text>
            </View>
          ) : null}

          {task.recurrenceRule ? (
            <View style={styles.metaRow}>
              <Icon name="repeat" size={18} color={theme.colors.primary} />
              <Text style={[styles.metaText, {color: theme.colors.onSurface}]}>
                {task.recurrenceRule.replace('RRULE:FREQ=', '').toLowerCase()}
              </Text>
            </View>
          ) : null}

          {task.duration > 0 ? (
            <View style={styles.metaRow}>
              <Icon name="clock-outline" size={18} color={theme.colors.taskComplete} />
              <Text style={[styles.metaText, {color: theme.colors.onSurface}]}>
                {formatDuration(task.duration)}
              </Text>
            </View>
          ) : null}
        </View>

        {subtasks.length > 0 ? (
          <>
            <Divider style={{backgroundColor: theme.colors.divider}} />
            <Text style={[styles.subtaskHeader, {color: theme.colors.taskComplete}]}>
              Subtasks ({subtasks.filter(s => s.status === 'completed').length}/{subtasks.length})
            </Text>
            {subtasks.map(st => (
              <TaskItem
                key={st.id}
                task={st}
                onPress={() => navigation.navigate('TaskDetail', {taskId: st.id})}
                onComplete={() =>
                  st.status === 'completed' ? reopenTask(st.id) : completeTask(st.id)
                }
              />
            ))}
          </>
        ) : null}

        <View style={styles.addSubtask}>
          <TouchableOpacity
            style={styles.addSubtaskBtn}
            onPress={() =>
              navigation.navigate('TaskEdit', {listId: task.listId, parentTaskId: taskId})
            }>
            <Icon name="plus" size={16} color={theme.colors.primary} />
            <Text style={[styles.addSubtaskText, {color: theme.colors.primary}]}>
              Add subtask
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerActions: {flexDirection: 'row'},
  headerBtn: {marginLeft: 16, padding: 4},
  scroll: {flex: 1},
  titleRow: {flexDirection: 'row', padding: 16},
  checkboxArea: {marginRight: 12, marginTop: 2},
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContent: {flex: 1},
  title: {fontSize: 20, fontWeight: '600', lineHeight: 26},
  notes: {fontSize: 14, marginTop: 8, lineHeight: 20},
  metaSection: {padding: 16},
  metaRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  metaText: {fontSize: 15, marginLeft: 12},
  subtaskHeader: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  addSubtask: {padding: 16},
  addSubtaskBtn: {flexDirection: 'row', alignItems: 'center'},
  addSubtaskText: {fontSize: 14, marginLeft: 8},
});

export default TaskDetailScreen;
