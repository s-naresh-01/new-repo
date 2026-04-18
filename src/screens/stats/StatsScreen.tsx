import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text} from 'react-native-paper';
import {format, subDays, startOfDay, endOfDay} from 'date-fns';
import {BarChart} from 'react-native-gifted-charts';
import {useTheme} from '../../hooks/useTheme';
import {tasksCollection, focusSessionsCollection} from '../../database';

const StatsScreen: React.FC = () => {
  const {theme} = useTheme();
  const [completedThisWeek, setCompletedThisWeek] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [focusMinutes, setFocusMinutes] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{value: number; label: string}[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const allTasks = await tasksCollection.query().fetch();
    const allSessions = await focusSessionsCollection.query().fetch();

    const oneWeekAgo = subDays(new Date(), 6);
    const weeklyCompleted = allTasks.filter(
      t => t.completedAt && t.completedAt >= oneWeekAgo.getTime(),
    );

    setCompletedThisWeek(weeklyCompleted.length);
    setTotalActive(allTasks.filter(t => t.status === 'active').length);

    const totalFocus = allSessions
      .filter(s => s.type === 'pomodoro')
      .reduce((sum, s) => sum + s.duration, 0);
    setFocusMinutes(totalFocus);

    const days: {value: number; label: string}[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const start = startOfDay(day).getTime();
      const end = endOfDay(day).getTime();
      const count = allTasks.filter(
        t => t.completedAt && t.completedAt >= start && t.completedAt <= end,
      ).length;
      days.push({value: count, label: format(day, 'EEE')});
    }
    setWeeklyData(days);
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    color,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    color: string;
  }) => (
    <View
      style={[
        styles.statCard,
        {backgroundColor: theme.colors.surface, borderColor: theme.colors.divider},
      ]}>
      <Text style={[styles.statValue, {color}]}>{value}</Text>
      <Text style={[styles.statTitle, {color: theme.colors.onSurface}]}>{title}</Text>
      <Text style={[styles.statSubtitle, {color: theme.colors.taskComplete}]}>
        {subtitle}
      </Text>
    </View>
  );

  const formatFocusTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={styles.content}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>
          Statistics
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Completed"
          value={completedThisWeek}
          subtitle="This week"
          color={theme.colors.primary}
        />
        <StatCard
          title="Active"
          value={totalActive}
          subtitle="Total tasks"
          color="#FF9800"
        />
        <StatCard
          title="Focus Time"
          value={formatFocusTime(focusMinutes)}
          subtitle="All time"
          color="#F44336"
        />
      </View>

      <View style={[styles.chartCard, {backgroundColor: theme.colors.surface}]}>
        <Text style={[styles.chartTitle, {color: theme.colors.onSurface}]}>
          Tasks Completed (7 days)
        </Text>
        {weeklyData.length > 0 ? (
          <BarChart
            data={weeklyData}
            barWidth={28}
            barBorderRadius={6}
            frontColor={theme.colors.primary}
            yAxisTextStyle={{color: theme.colors.taskComplete}}
            xAxisLabelTextStyle={{color: theme.colors.taskComplete}}
            noOfSections={4}
            maxValue={Math.max(...weeklyData.map(d => d.value), 5)}
            isAnimated
            hideRules
          />
        ) : (
          <Text style={[styles.noData, {color: theme.colors.taskComplete}]}>
            No data yet
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {paddingBottom: 40},
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {fontSize: 22, fontWeight: '700'},
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  statValue: {fontSize: 28, fontWeight: '700'},
  statTitle: {fontSize: 13, fontWeight: '600', marginTop: 4},
  statSubtitle: {fontSize: 11, marginTop: 2},
  chartCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  chartTitle: {fontSize: 15, fontWeight: '600', marginBottom: 16},
  noData: {textAlign: 'center', padding: 20},
});

export default StatsScreen;
