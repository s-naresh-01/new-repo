import React, {useState, useEffect} from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import {Calendar} from 'react-native-calendars';
import {useNavigation} from '@react-navigation/native';
import {format, startOfDay, endOfDay} from 'date-fns';
import {useTheme} from '../../hooks/useTheme';
import {useTaskActions} from '../../hooks/useTaskActions';
import {tasksCollection} from '../../database';
import TaskItem from '../../components/TaskItem';
import FAB from '../../components/FAB';
import EmptyState from '../../components/EmptyState';

const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {theme, isDark} = useTheme();
  const {completeTask, reopenTask} = useTaskActions();

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [dayTasks, setDayTasks] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    const subscription = tasksCollection
      .query()
      .observe()
      .subscribe((all: any[]) => {
        const withDates = all.filter(t => t.status !== 'deleted' && t.dueDate);
        setAllTasks(withDates);
        buildMarkedDates(withDates);
      });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    filterByDate(selectedDate);
  }, [selectedDate, allTasks]);

  const buildMarkedDates = (tasks: any[]) => {
    const dots: any = {};
    tasks.forEach(t => {
      const key = format(new Date(t.dueDate), 'yyyy-MM-dd');
      if (!dots[key]) dots[key] = {dots: []};
      dots[key].dots.push({
        color: t.status === 'completed' ? theme.colors.taskComplete : theme.colors.primary,
      });
    });
    setMarkedDates(dots);
  };

  const filterByDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const start = startOfDay(date).getTime();
    const end = endOfDay(date).getTime();
    const tasks = allTasks.filter(t => t.dueDate >= start && t.dueDate <= end);
    setDayTasks(tasks.sort((a, b) => (a.dueTime || 0) - (b.dueTime || 0)));
  };

  const calendarTheme = {
    backgroundColor: theme.colors.background,
    calendarBackground: theme.colors.background,
    textSectionTitleColor: theme.colors.taskComplete,
    selectedDayBackgroundColor: theme.colors.primary,
    selectedDayTextColor: '#ffffff',
    todayTextColor: theme.colors.primary,
    dayTextColor: theme.colors.onSurface,
    textDisabledColor: theme.colors.taskComplete,
    arrowColor: theme.colors.primary,
    monthTextColor: theme.colors.onSurface,
    dotColor: theme.colors.primary,
    selectedDotColor: '#ffffff',
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Calendar
        current={selectedDate}
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
          },
        }}
        markingType="multi-dot"
        theme={calendarTheme}
        style={[styles.calendar, {borderBottomColor: theme.colors.divider}]}
      />

      <View style={styles.dayHeader}>
        <Text style={[styles.dayTitle, {color: theme.colors.onSurface}]}>
          {format(new Date(selectedDate), 'EEEE, MMMM d')}
        </Text>
        <Text style={[styles.dayCount, {color: theme.colors.taskComplete}]}>
          {dayTasks.filter(t => t.status === 'active').length} tasks
        </Text>
      </View>

      {dayTasks.length === 0 ? (
        <EmptyState
          icon="calendar-check-outline"
          title="Nothing scheduled"
          subtitle="Tap + to add a task for this day."
        />
      ) : (
        <FlatList
          data={dayTasks}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TaskItem
              task={item}
              onPress={() => navigation.navigate('TaskDetail', {taskId: item.id})}
              onComplete={() =>
                item.status === 'completed'
                  ? reopenTask(item.id)
                  : completeTask(item.id)
              }
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        onPress={() =>
          navigation.navigate('TaskEdit', {
            dueDate: new Date(selectedDate).getTime(),
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  calendar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dayTitle: {fontSize: 16, fontWeight: '600'},
  dayCount: {fontSize: 12, marginTop: 2},
  list: {paddingBottom: 80},
});

export default CalendarScreen;
