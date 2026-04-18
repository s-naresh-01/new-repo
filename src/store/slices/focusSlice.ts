import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {FocusSessionType} from '../../types';

interface FocusState {
  isRunning: boolean;
  isPaused: boolean;
  currentType: FocusSessionType;
  remainingSeconds: number;
  totalSeconds: number;
  completedPomodoros: number;
  currentTaskId: string | null;
  sessionStartedAt: number | null;
}

const initialState: FocusState = {
  isRunning: false,
  isPaused: false,
  currentType: 'pomodoro',
  remainingSeconds: 25 * 60,
  totalSeconds: 25 * 60,
  completedPomodoros: 0,
  currentTaskId: null,
  sessionStartedAt: null,
};

const focusSlice = createSlice({
  name: 'focus',
  initialState,
  reducers: {
    startTimer: (
      state,
      action: PayloadAction<{type: FocusSessionType; durationSeconds: number; taskId?: string}>,
    ) => {
      state.isRunning = true;
      state.isPaused = false;
      state.currentType = action.payload.type;
      state.remainingSeconds = action.payload.durationSeconds;
      state.totalSeconds = action.payload.durationSeconds;
      state.currentTaskId = action.payload.taskId ?? null;
      state.sessionStartedAt = Date.now();
    },
    pauseTimer: state => {
      state.isPaused = true;
      state.isRunning = false;
    },
    resumeTimer: state => {
      state.isPaused = false;
      state.isRunning = true;
    },
    tickTimer: state => {
      if (state.remainingSeconds > 0) {
        state.remainingSeconds -= 1;
      }
    },
    completeTimer: state => {
      state.isRunning = false;
      state.isPaused = false;
      if (state.currentType === 'pomodoro') {
        state.completedPomodoros += 1;
      }
    },
    stopTimer: state => {
      state.isRunning = false;
      state.isPaused = false;
      state.sessionStartedAt = null;
    },
    resetPomodoros: state => {
      state.completedPomodoros = 0;
    },
  },
});

export const {
  startTimer,
  pauseTimer,
  resumeTimer,
  tickTimer,
  completeTimer,
  stopTimer,
  resetPomodoros,
} = focusSlice.actions;

export default focusSlice.reducer;
