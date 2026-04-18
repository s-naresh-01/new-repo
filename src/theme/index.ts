import {MD3LightTheme, MD3DarkTheme} from 'react-native-paper';

const baseLight = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4772FA',
    primaryContainer: '#EEF1FF',
    secondary: '#14C2B8',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    onSurface: '#1C1C1C',
    onBackground: '#1C1C1C',
    outline: '#E0E0E0',
    error: '#F44336',
    taskComplete: '#9E9E9E',
    divider: '#F0F0F0',
    cardBackground: '#FFFFFF',
    sidebarBackground: '#FAFAFA',
    priorityHigh: '#F44336',
    priorityMed: '#FF9800',
    priorityLow: '#2196F3',
    priorityNone: '#9E9E9E',
    todayAccent: '#4772FA',
  },
  custom: {
    taskItemHeight: 56,
    headerHeight: 56,
    borderRadius: 12,
  },
};

const baseDark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#5B87FF',
    primaryContainer: '#1A2A5E',
    secondary: '#14C2B8',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2A2A2A',
    onSurface: '#E8E8E8',
    onBackground: '#E8E8E8',
    outline: '#3A3A3A',
    error: '#EF5350',
    taskComplete: '#666666',
    divider: '#2A2A2A',
    cardBackground: '#1E1E1E',
    sidebarBackground: '#161616',
    priorityHigh: '#EF5350',
    priorityMed: '#FFA726',
    priorityLow: '#42A5F5',
    priorityNone: '#757575',
    todayAccent: '#5B87FF',
  },
  custom: {
    taskItemHeight: 56,
    headerHeight: 56,
    borderRadius: 12,
  },
};

export const lightTheme = baseLight;
export const darkTheme = baseDark;

export type AppTheme = typeof lightTheme;
