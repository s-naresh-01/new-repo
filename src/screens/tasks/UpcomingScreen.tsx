import React, {useState, useEffect} from 'react';
import {View, SectionList, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {format, addDays, startOfDay, endOfDay, isToday, isTomorrow} from 'date-fns';
import {useTheme} from '../../hooks/useTheme';
import {useTaskActions} from '../../hooks/useTaskActions';
import {tasksCollection} from '../../database';
import TaskItem from '../../components/TaskItem';
import FAB from '../../components/FAB';
import EmptyState from '../../components/EmptyState';

const UpcomingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {theme} = useTheme();
  const {completeTask, reopenTask} = useTaskActions();
  const [sections, setSections] = useState<{title: string; date: Date; data: any[]}[]>([]);

  useEffect(() => {
    const subscription = tasksCollection
      .query()
      .observe()
      .subscribe((all: any[]) => {
        const upcoming = all.filter(
          t => t.status !== 'deleted' && t.dueDate != null,
        );

        const days: {title: string; date: Date; data: any[]}[] = [];
        for (let i = 0; i < 30; i++) {
          const day = addDays(new Date(), i);
          const start = startOfDay(day).getTime();
          const end = endOfDay(day).getTime();
          const dayTasks = upcoming
            .filter(t => t.dueDate >= start && t.dueDate <= end)
            .sort((a, b) => b.priority - a.priority);
          if (dayTasks.length > 0) {
            const label = isToday(day)
              ? 'Today'
              : isTomorrow(day)
              ? 'Tomorrow'
              : format(day, 'EEEE, MMM d');
            days.push({title: label, date: day, data: dayTasks});
          }
        }
        setSections(days);
      });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>Upcoming</Text>
      </View>

      {sections.length === 0 ? (
        <EmptyState
          icon="calendar-clock"
          title="Nothing upcoming"
          subtitle="Add due dates to your tasks to see them here."
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderSectionHeader={({section: {title, date}}) => (
            <View
              style={[
                styles.sectionHeader,
                {backgroundColor: theme.colors.surfaceVariant},
              ]}>
              <Text style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
                {title}
              </Text>
              <Text style={[styles.sectionDate, {color: theme.colors.taskComplete}]}>
                {isToday(date) ? '' : format(date, 'MMM d')}
              </Text>
            </View>
          )}
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

      <FAB onPress={() => navigation.navigate('TaskEdit', {})} />
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {fontSize: 14, fontWeight: '600'},
  sectionDate: {fontSize: 12},
  list: {paddingBottom: 80},
});

export default UpcomingScreen;
