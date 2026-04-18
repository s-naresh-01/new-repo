import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../hooks/useTheme';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
} from '../../store/slices/focusSlice';
import {usePomodoroTimer} from '../../hooks/usePomodoroTimer';
import {formatTimerDisplay} from '../../utils/dateHelpers';
import {FocusSessionType} from '../../types';

const SESSION_TYPES: {type: FocusSessionType; label: string; color: string}[] = [
  {type: 'pomodoro', label: 'Focus', color: '#F44336'},
  {type: 'short_break', label: 'Short Break', color: '#4CAF50'},
  {type: 'long_break', label: 'Long Break', color: '#2196F3'},
];

const FocusScreen: React.FC = () => {
  const {theme} = useTheme();
  const dispatch = useAppDispatch();
  const focus = useAppSelector(s => s.focus);
  const settings = useAppSelector(s => s.settings);
  usePomodoroTimer();

  const progress = 1 - focus.remainingSeconds / focus.totalSeconds;

  const getDuration = (type: FocusSessionType): number => {
    switch (type) {
      case 'pomodoro': return settings.pomodoroMinutes * 60;
      case 'short_break': return settings.shortBreakMinutes * 60;
      case 'long_break': return settings.longBreakMinutes * 60;
    }
  };

  const handleStart = (type: FocusSessionType) => {
    dispatch(startTimer({type, durationSeconds: getDuration(type)}));
  };

  const currentSession = SESSION_TYPES.find(s => s.type === focus.currentType)!;
  const accentColor = currentSession.color;

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.divider}]}>
        <Text style={[styles.headerTitle, {color: theme.colors.onSurface}]}>Focus</Text>
        <View style={styles.pomodoroCount}>
          {Array.from({length: settings.pomodorosUntilLongBreak}).map((_, i) => (
            <View
              key={i}
              style={[
                styles.pomodoroDot,
                {
                  backgroundColor:
                    i < focus.completedPomodoros % settings.pomodorosUntilLongBreak
                      ? accentColor
                      : theme.colors.outline,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Session type tabs */}
      <View style={styles.tabs}>
        {SESSION_TYPES.map(st => (
          <TouchableOpacity
            key={st.type}
            onPress={() => !focus.isRunning && handleStart(st.type)}
            style={[
              styles.tab,
              focus.currentType === st.type && {
                backgroundColor: `${st.color}22`,
                borderColor: st.color,
              },
            ]}>
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    focus.currentType === st.type ? st.color : theme.colors.taskComplete,
                },
              ]}>
              {st.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timer display */}
      <View style={styles.timerContainer}>
        <View style={[styles.timerRing, {borderColor: `${accentColor}33`}]}>
          <View style={[styles.timerInner, {borderColor: accentColor}]}>
            <Text style={[styles.timerText, {color: theme.colors.onSurface}]}>
              {formatTimerDisplay(focus.remainingSeconds)}
            </Text>
            <Text style={[styles.sessionLabel, {color: theme.colors.taskComplete}]}>
              {currentSession.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!focus.isRunning && !focus.isPaused ? (
          <TouchableOpacity
            style={[styles.mainBtn, {backgroundColor: accentColor}]}
            onPress={() => handleStart(focus.currentType)}>
            <Icon name="play" size={32} color="#FFF" />
          </TouchableOpacity>
        ) : focus.isPaused ? (
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={[styles.secondaryBtn, {borderColor: theme.colors.outline}]}
              onPress={() => dispatch(stopTimer())}>
              <Icon name="stop" size={24} color={theme.colors.taskComplete} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainBtn, {backgroundColor: accentColor}]}
              onPress={() => dispatch(resumeTimer())}>
              <Icon name="play" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={[styles.secondaryBtn, {borderColor: theme.colors.outline}]}
              onPress={() => dispatch(stopTimer())}>
              <Icon name="stop" size={24} color={theme.colors.taskComplete} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainBtn, {backgroundColor: accentColor}]}
              onPress={() => dispatch(pauseTimer())}>
              <Icon name="pause" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={[styles.completedText, {color: theme.colors.taskComplete}]}>
        {focus.completedPomodoros} pomodoro{focus.completedPomodoros !== 1 ? 's' : ''} today
      </Text>
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
  pomodoroCount: {flexDirection: 'row', gap: 6},
  pomodoroDot: {width: 10, height: 10, borderRadius: 5},
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {fontSize: 13, fontWeight: '500'},
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerInner: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {fontSize: 64, fontWeight: '300', letterSpacing: -2},
  sessionLabel: {fontSize: 14, marginTop: 4},
  controls: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  controlRow: {flexDirection: 'row', alignItems: 'center', gap: 20},
  mainBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  secondaryBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    textAlign: 'center',
    fontSize: 14,
    paddingBottom: 24,
  },
});

export default FocusScreen;
