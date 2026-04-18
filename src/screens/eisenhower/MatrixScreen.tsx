import React, {useState, useEffect} from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity, ScrollView} from 'react-native';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../hooks/useTheme';
import {tasksCollection} from '../../database';
import {useTaskActions} from '../../hooks/useTaskActions';
import {getPriorityColor} from '../../utils/priorityHelpers';
import {Priority} from '../../types';

interface Quadrant {
  key: string;
  title: string;
  subtitle: string;
  color: string;
  filter: (t: any) => boolean;
}

const QUADRANTS: Quadrant[] = [
  {
    key: 'do',
    title: 'Do First',
    subtitle: 'Urgent & Important',
    color: '#F44336',
    filter: t => t.priority >= 2 && t.dueDate != null,
  },
  {
    key: 'schedule',
    title: 'Schedule',
    subtitle: 'Not Urgent & Important',
    color: '#2196F3',
    filter: t => t.priority >= 2 && t.dueDate == null,
  },
  {
    key: 'delegate',
    title: 'Delegate',
    subtitle: 'Urgent & Less Important',
    color: '#FF9800',
    filter: t => t.priority < 2 && t.dueDate != null,
  },
  {
    key: 'eliminate',
    title: 'Eliminate',
    subtitle: 'Not Urgent & Less Important',
    color: '#9E9E9E',
    filter: t => t.priority < 2 && t.dueDate == null,
  },
];

const MatrixScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {theme} = useTheme();
  const {completeTask} = useTaskActions();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const subscription = tasksCollection
      .query()
      .observe()
      .subscribe((all: any[]) =>
        setTasks(all.filter(t => t.status === 'active')),
      );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>
          Eisenhower Matrix
        </Text>
      </View>
      <View style={styles.grid}>
        {QUADRANTS.map(q => {
          const quadrantTasks = tasks.filter(q.filter);
          return (
            <View
              key={q.key}
              style={[
                styles.quadrant,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: `${q.color}44`,
                },
              ]}>
              <View style={[styles.quadrantHeader, {borderBottomColor: `${q.color}44`}]}>
                <View style={[styles.quadrantDot, {backgroundColor: q.color}]} />
                <View>
                  <Text style={[styles.quadrantTitle, {color: theme.colors.onSurface}]}>
                    {q.title}
                  </Text>
                  <Text style={[styles.quadrantSub, {color: theme.colors.taskComplete}]}>
                    {q.subtitle}
                  </Text>
                </View>
                <Text style={[styles.quadrantCount, {color: q.color}]}>
                  {quadrantTasks.length}
                </Text>
              </View>
              {quadrantTasks.slice(0, 5).map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.matrixTask}
                  onPress={() => navigation.navigate('TaskDetail', {taskId: t.id})}>
                  <TouchableOpacity
                    style={[styles.smallCheck, {borderColor: q.color}]}
                    onPress={() => completeTask(t.id)}>
                  </TouchableOpacity>
                  <Text
                    style={[styles.taskTitle, {color: theme.colors.onSurface}]}
                    numberOfLines={2}>
                    {t.title}
                  </Text>
                </TouchableOpacity>
              ))}
              {quadrantTasks.length > 5 && (
                <Text style={[styles.more, {color: theme.colors.taskComplete}]}>
                  +{quadrantTasks.length - 5} more
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
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
  grid: {flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 8},
  quadrant: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  quadrantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  quadrantDot: {width: 10, height: 10, borderRadius: 5},
  quadrantTitle: {fontSize: 13, fontWeight: '700'},
  quadrantSub: {fontSize: 10},
  quadrantCount: {marginLeft: 'auto', fontSize: 16, fontWeight: '700'},
  matrixTask: {flexDirection: 'row', alignItems: 'flex-start', padding: 8, gap: 8},
  smallCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    marginTop: 2,
  },
  taskTitle: {flex: 1, fontSize: 12, lineHeight: 16},
  more: {fontSize: 11, padding: 8, paddingTop: 0},
});

export default MatrixScreen;
