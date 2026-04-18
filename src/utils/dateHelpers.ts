import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isThisWeek,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  differenceInDays,
  parseISO,
  formatISO,
} from 'date-fns';

export const formatTaskDate = (timestamp: number | null): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  return format(date, 'MMM d');
};

export const formatTaskDateTime = (
  dateTs: number | null,
  timeTs: number | null,
): string => {
  if (!dateTs) return '';
  const date = new Date(dateTs);
  const datePart = formatTaskDate(dateTs);
  if (!timeTs) return datePart;
  const time = new Date(timeTs);
  return `${datePart} ${format(time, 'h:mm a')}`;
};

export const formatFullDate = (timestamp: number): string =>
  format(new Date(timestamp), 'MMMM d, yyyy');

export const formatTime = (timestamp: number): string =>
  format(new Date(timestamp), 'h:mm a');

export const isOverdue = (dueDate: number | null, status: string): boolean => {
  if (!dueDate || status === 'completed') return false;
  return new Date(dueDate) < startOfDay(new Date());
};

export const todayRange = () => ({
  start: startOfDay(new Date()).getTime(),
  end: endOfDay(new Date()).getTime(),
});

export const weekRange = () => ({
  start: startOfWeek(new Date(), {weekStartsOn: 1}).getTime(),
  end: endOfWeek(new Date(), {weekStartsOn: 1}).getTime(),
});

export const nextSevenDaysRange = () => ({
  start: startOfDay(new Date()).getTime(),
  end: endOfDay(addDays(new Date(), 6)).getTime(),
});

export const toGoogleDate = (timestamp: number, isAllDay: boolean) => {
  const date = new Date(timestamp);
  if (isAllDay) {
    return {date: format(date, 'yyyy-MM-dd')};
  }
  return {dateTime: date.toISOString(), timeZone: 'UTC'};
};

export const fromGoogleDate = (googleDate: {
  date?: string;
  dateTime?: string;
}): number => {
  if (googleDate.date) {
    return parseISO(googleDate.date).getTime();
  }
  if (googleDate.dateTime) {
    return new Date(googleDate.dateTime).getTime();
  }
  return Date.now();
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const formatTimerDisplay = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const toDateString = (date: Date): string =>
  format(date, 'yyyy-MM-dd');
