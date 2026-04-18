import React, {useState, useEffect} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import {useTheme} from '../../hooks/useTheme';
import {useTaskActions} from '../../hooks/useTaskActions';
import {tasksCollection} from '../../database';
import {todayRange} from '../../utils/dateHelpers';
import TaskItem from '../../components/TaskItem';
import FAB from '../../components/FAB';
import EmptyState from '../../components/EmptyState';

const TodayScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {theme} = useTheme();
  const {completeTask, reopenTask} = useTaskActions();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const {start, end} = todayRange();
    const subscription = tasksCollection
      .query()
      .observe()
      .subscribe((all: any[]) => {
        const todayTasks = all.filter(
          t =>
            t.status !== 'deleted' &&
            t.dueDate &&
            t.dueDate >= start &&
            t.dueDate <= end,
        );
        setTasks(todayTasks.sort((a, b) => b.priority - a.priority));
      });
    return () => subscription.unsubscribe();
  }, []);

  const activeTasks = tasks.filter(t => t.status === 'active');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>
          {format(new Date(), 'EEEE, MMM d')}
        </Text>
        <Text style={[styles.headerCount, {color: theme.colors.primary}]}>
          {activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {tasks.length === 0 ? (
        <EmptyState
          icon="check-circle-outline"
          title="All clear for today!"
          subtitle="Add tasks with today as the due date to see them here."
        />
      ) : (
        <FlatList
          data={[...activeTasks, ...completedTasks]}
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
          navigation.navigate('TaskEdit', {dueDate: Date.now()})
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
  headerCount: {fontSize: 13, marginTop: 2},
  list: {paddingBottom: 80},
});

export default TodayScreen;
