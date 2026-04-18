import React, {useState, useEffect} from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {Text, Searchbar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../hooks/useTheme';
import {useTaskActions} from '../../hooks/useTaskActions';
import {tasksCollection} from '../../database';
import TaskItem from '../../components/TaskItem';
import FAB from '../../components/FAB';
import EmptyState from '../../components/EmptyState';

const AllTasksScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {theme} = useTheme();
  const {completeTask, reopenTask} = useTaskActions();
  const [tasks, setTasks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const subscription = tasksCollection
      .query()
      .observe()
      .subscribe((all: any[]) => {
        setTasks(all.filter(t => t.status !== 'deleted'));
      });
    return () => subscription.unsubscribe();
  }, []);

  const filtered = tasks.filter(t => {
    if (!showCompleted && t.status === 'completed') return false;
    if (search) {
      return (
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return true;
  });

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>All Tasks</Text>
        <TouchableOpacity onPress={() => setShowCompleted(s => !s)}>
          <Text style={[styles.toggle, {color: theme.colors.primary}]}>
            {showCompleted ? 'Hide done' : 'Show done'}
          </Text>
        </TouchableOpacity>
      </View>

      <Searchbar
        placeholder="Search tasks..."
        value={search}
        onChangeText={setSearch}
        style={[styles.searchbar, {backgroundColor: theme.colors.surfaceVariant}]}
        inputStyle={{color: theme.colors.onSurface}}
        iconColor={theme.colors.taskComplete}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon="text-search"
          title={search ? 'No results' : 'No tasks yet'}
          subtitle={search ? 'Try a different search term.' : 'Create your first task!'}
        />
      ) : (
        <FlatList
          data={filtered}
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

      <FAB onPress={() => navigation.navigate('TaskEdit', {})} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {fontSize: 22, fontWeight: '700'},
  toggle: {fontSize: 14},
  searchbar: {margin: 12, elevation: 0, borderRadius: 10},
  list: {paddingBottom: 80},
});

export default AllTasksScreen;
