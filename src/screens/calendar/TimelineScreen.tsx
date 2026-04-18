import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import {format, addDays, startOfDay, endOfDay} from 'date-fns';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../hooks/useTheme';
import {tasksCollection} from '../../database';
import {getPriorityColor} from '../../utils/priorityHelpers';
import {Priority} from '../../types';
import FAB from '../../components/FAB';

const HOURS = Array.from({length: 24}, (_, i) => i);

const TimelineScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {theme} = useTheme();
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const start = startOfDay(selectedDay).getTime();
    const end = endOfDay(selectedDay).getTime();
    const subscription = tasksCollection
      .query()
      .observe()
      .subscribe((all: any[]) => {
        setTasks(
          all.filter(
            t =>
              t.status !== 'deleted' &&
              t.dueDate &&
              t.dueDate >= start &&
              t.dueDate <= end &&
              t.dueTime,
          ),
        );
      });
    return () => subscription.unsubscribe();
  }, [selectedDay]);

  const HOUR_HEIGHT = 60;

  const getTaskStyle = (task: any) => {
    const time = new Date(task.dueTime);
    const hour = time.getHours();
    const min = time.getMinutes();
    const top = (hour + min / 60) * HOUR_HEIGHT;
    const height = Math.max((task.duration / 60) * HOUR_HEIGHT, 24);
    return {top, height};
  };

  const weekDays = Array.from({length: 7}, (_, i) => addDays(new Date(), i - 3));

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>Timeline</Text>
      </View>

      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.daySelectorScroll, {borderBottomColor: theme.colors.divider}]}>
        {weekDays.map(day => {
          const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');
          return (
            <TouchableOpacity
              key={day.toISOString()}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayBtn,
                isSelected && {backgroundColor: theme.colors.primary},
              ]}>
              <Text
                style={[
                  styles.dayBtnDay,
                  {color: isSelected ? '#FFF' : theme.colors.taskComplete},
                ]}>
                {format(day, 'EEE')}
              </Text>
              <Text
                style={[
                  styles.dayBtnNum,
                  {color: isSelected ? '#FFF' : theme.colors.onSurface},
                ]}>
                {format(day, 'd')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.timeline}>
        <View style={styles.timelineContent}>
          {/* Hour lines */}
          {HOURS.map(hour => (
            <View
              key={hour}
              style={[styles.hourRow, {borderTopColor: theme.colors.divider}]}>
              <Text style={[styles.hourLabel, {color: theme.colors.taskComplete}]}>
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </Text>
              <View style={[styles.hourLine, {backgroundColor: theme.colors.divider}]} />
            </View>
          ))}

          {/* Task blocks */}
          {tasks.map(task => {
            const s = getTaskStyle(task);
            return (
              <TouchableOpacity
                key={task.id}
                onPress={() => navigation.navigate('TaskDetail', {taskId: task.id})}
                style={[
                  styles.taskBlock,
                  {
                    top: s.top,
                    height: s.height,
                    backgroundColor: `${getPriorityColor(task.priority as Priority)}CC`,
                  },
                ]}>
                <Text style={styles.taskBlockText} numberOfLines={2}>
                  {task.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <FAB
        onPress={() =>
          navigation.navigate('TaskEdit', {dueDate: selectedDay.getTime()})
        }
      />
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
  daySelectorScroll: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    maxHeight: 70,
  },
  dayBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    margin: 8,
  },
  dayBtnDay: {fontSize: 11},
  dayBtnNum: {fontSize: 18, fontWeight: '600'},
  timeline: {flex: 1},
  timelineContent: {
    position: 'relative',
    paddingLeft: 60,
    paddingBottom: 80,
  },
  hourRow: {
    height: 60,
    borderTopWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  hourLabel: {
    position: 'absolute',
    left: -56,
    top: -8,
    fontSize: 11,
    width: 50,
    textAlign: 'right',
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    top: 0,
  },
  taskBlock: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 6,
    padding: 4,
  },
  taskBlockText: {fontSize: 11, color: '#FFF', fontWeight: '600'},
});

export default TimelineScreen;
