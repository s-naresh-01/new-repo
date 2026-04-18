import React, {memo} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Text, Checkbox} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../hooks/useTheme';
import {formatTaskDateTime, isOverdue} from '../utils/dateHelpers';
import {getPriorityColor} from '../utils/priorityHelpers';
import {ITask, Priority} from '../types';

interface Props {
  task: ITask;
  onPress: () => void;
  onComplete: () => void;
  onLongPress?: () => void;
  selected?: boolean;
}

const TaskItem = memo<Props>(({task, onPress, onComplete, onLongPress, selected}) => {
  const {theme} = useTheme();
  const isCompleted = task.status === 'completed';
  const overdue = isOverdue(task.dueDate, task.status);
  const priorityColor = getPriorityColor(task.priority as Priority);
  const dateText = formatTaskDateTime(task.dueDate, task.dueTime);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: selected
            ? theme.colors.primaryContainer
            : theme.colors.surface,
          borderBottomColor: theme.colors.divider,
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}>
      <TouchableOpacity onPress={onComplete} style={styles.checkboxArea}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: isCompleted ? theme.colors.taskComplete : priorityColor,
              backgroundColor: isCompleted ? theme.colors.taskComplete : 'transparent',
            },
          ]}>
          {isCompleted && (
            <Icon name="check" size={14} color={theme.colors.surface} />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: isCompleted
                ? theme.colors.taskComplete
                : theme.colors.onSurface,
              textDecorationLine: isCompleted ? 'line-through' : 'none',
            },
          ]}
          numberOfLines={2}>
          {task.title}
        </Text>

        <View style={styles.meta}>
          {dateText ? (
            <View style={styles.dateRow}>
              <Icon
                name="calendar-outline"
                size={12}
                color={overdue ? theme.colors.error : theme.colors.taskComplete}
              />
              <Text
                style={[
                  styles.dateText,
                  {
                    color: overdue
                      ? theme.colors.error
                      : theme.colors.taskComplete,
                  },
                ]}>
                {' '}{dateText}
              </Text>
            </View>
          ) : null}

          {task.recurrenceRule ? (
            <Icon
              name="repeat"
              size={12}
              color={theme.colors.taskComplete}
              style={styles.metaIcon}
            />
          ) : null}

          {task.notes ? (
            <Icon
              name="text-box-outline"
              size={12}
              color={theme.colors.taskComplete}
              style={styles.metaIcon}
            />
          ) : null}

          {task.reminderOffsets &&
          (Array.isArray(task.reminderOffsets)
            ? (task.reminderOffsets as unknown as number[]).length > 0
            : JSON.parse((task.reminderOffsets as unknown as string) || '[]').length > 0) ? (
            <Icon
              name="bell-outline"
              size={12}
              color={theme.colors.taskComplete}
              style={styles.metaIcon}
            />
          ) : null}
        </View>
      </View>

      {task.priority > 0 && (
        <View style={[styles.priorityDot, {backgroundColor: priorityColor}]} />
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  checkboxArea: {
    padding: 4,
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
  },
  metaIcon: {
    marginLeft: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});

export default TaskItem;
