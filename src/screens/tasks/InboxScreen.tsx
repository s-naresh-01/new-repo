import React, {useState, useEffect} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../hooks/useTheme';
import {useTaskActions} from '../../hooks/useTaskActions';
import {tasksCollection} from '../../database';
import TaskItem from '../../components/TaskItem';
import FAB from '../../components/FAB';
import EmptyState from '../../components/EmptyState';

const InboxScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {theme} = useTheme();
  const {completeTask, reopenTask} = useTaskActions();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const subscription = tasksCollection
      .query()
      .observe()
      .subscribe((all: any[]) => {
        const inboxTasks = all.filter(
          t => t.status !== 'deleted' && (t.listId === 'inbox' || !t.listId),
        );
        setTasks(inboxTasks.sort((a, b) => b.sortOrder - a.sortOrder));
      });
    return () => subscription.unsubscribe();
  }, []);

  const activeTasks = tasks.filter(t => t.status === 'active');

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>Inbox</Text>
        <Text style={[styles.headerCount, {color: theme.colors.taskComplete}]}>
          {activeTasks.length} tasks
        </Text>
      </View>

      {tasks.length === 0 ? (
        <EmptyState
          icon="inbox-outline"
          title="Inbox is empty"
          subtitle="Capture tasks quickly and sort them later."
        />
      ) : (
        <FlatList
          data={tasks}
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

      <FAB onPress={() => navigation.navigate('TaskEdit', {listId: 'inbox'})} />
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

export default InboxScreen;
