import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ThemeMode} from '../../types';

interface SettingsState {
  themeMode: ThemeMode;
  accentColor: string;
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  pomodorosUntilLongBreak: number;
  notificationsEnabled: boolean;
  calendarSyncEnabled: boolean;
  calendarSyncInterval: number;
  defaultListId: string;
  startOfWeek: number;
  showCompletedTasks: boolean;
  smartDateParsing: boolean;
}

const initialState: SettingsState = {
  themeMode: 'system',
  accentColor: '#4772FA',
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  pomodorosUntilLongBreak: 4,
  notificationsEnabled: true,
  calendarSyncEnabled: false,
  calendarSyncInterval: 15,
  defaultListId: 'inbox',
  startOfWeek: 1,
  showCompletedTasks: true,
  smartDateParsing: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.accentColor = action.payload;
    },
    setPomodoroMinutes: (state, action: PayloadAction<number>) => {
      state.pomodoroMinutes = action.payload;
    },
    setShortBreakMinutes: (state, action: PayloadAction<number>) => {
      state.shortBreakMinutes = action.payload;
    },
    setLongBreakMinutes: (state, action: PayloadAction<number>) => {
      state.longBreakMinutes = action.payload;
    },
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
    },
    setCalendarSyncEnabled: (state, action: PayloadAction<boolean>) => {
      state.calendarSyncEnabled = action.payload;
    },
    setDefaultListId: (state, action: PayloadAction<string>) => {
      state.defaultListId = action.payload;
    },
    setShowCompletedTasks: (state, action: PayloadAction<boolean>) => {
      state.showCompletedTasks = action.payload;
    },
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return {...state, ...action.payload};
    },
  },
});

export const {
  setThemeMode,
  setAccentColor,
  setPomodoroMinutes,
  setShortBreakMinutes,
  setLongBreakMinutes,
  setNotificationsEnabled,
  setCalendarSyncEnabled,
  setDefaultListId,
  setShowCompletedTasks,
  updateSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
