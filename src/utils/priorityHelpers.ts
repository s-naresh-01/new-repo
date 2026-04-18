import {Priority} from '../types';
import {PRIORITY_COLORS, PRIORITY_LABELS} from '../theme/colors';

export const getPriorityColor = (priority: Priority): string =>
  PRIORITY_COLORS[priority];

export const getPriorityLabel = (priority: Priority): string =>
  PRIORITY_LABELS[priority];

export const getPriorityIcon = (priority: Priority): string => {
  switch (priority) {
    case 3: return 'flag';
    case 2: return 'flag-outline';
    case 1: return 'flag-variant-outline';
    default: return 'flag-off-outline';
  }
};

export const sortByPriority = <T extends {priority: number}>(items: T[]): T[] =>
  [...items].sort((a, b) => b.priority - a.priority);
