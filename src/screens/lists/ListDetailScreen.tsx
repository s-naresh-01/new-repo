import React, {useState, useEffect} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../../hooks/useTheme';
import {useTaskActions} from '../../hooks/useTaskActions';
import {tasksCollection, listsCollection} from '../../database';
import TaskItem from '../../components/TaskItem';
import FAB from '../../components/FAB';
import EmptyState from '../../components/EmptyState';

const ListDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {theme} = useTheme();
  const {completeTask, reopenTask} = useTaskActions();
  const listId = route.params?.listId;

  const [list, setList] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!listId) return;
    listsCollection.find(listId).then(setList).catch(() => {});

    const subscription = tasksCollection
      .query()
      .observe()
      .subscribe((all: any[]) => {
        setTasks(
          all
            .filter(t => t.listId === listId && t.status !== 'deleted')
            .sort((a, b) => b.sortOrder - a.sortOrder),
        );
      });
    return () => subscription.unsubscribe();
  }, [listId]);

  const activeTasks = tasks.filter(t => t.status === 'active');

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        {list && (
          <View style={[styles.listDot, {backgroundColor: list.color}]} />
        )}
        <View>
          <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>
            {list?.name || 'List'}
          </Text>
          <Text style={[styles.headerCount, {color: theme.colors.taskComplete}]}>
            {activeTasks.length} tasks
          </Text>
        </View>
      </View>

      {tasks.length === 0 ? (
        <EmptyState
          icon="format-list-checks"
          title="No tasks in this list"
          subtitle="Tap + to add your first task."
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

      <FAB onPress={() => navigation.navigate('TaskEdit', {listId})} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listDot: {width: 16, height: 16, borderRadius: 8, marginRight: 12},
  headerTitle: {fontSize: 22, fontWeight: '700'},
  headerCount: {fontSize: 13, marginTop: 2},
  list: {paddingBottom: 80},
});

export default ListDetailScreen;
