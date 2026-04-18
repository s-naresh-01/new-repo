import {
  addDays,
  addHours,
  addMinutes,
  addWeeks,
  addMonths,
  startOfDay,
  setHours,
  setMinutes,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday,
  nextSunday,
  parseISO,
  isValid,
} from 'date-fns';

interface ParsedDate {
  date: Date;
  hasTime: boolean;
}

const TIME_PATTERNS: {regex: RegExp; getHours: (m: RegExpMatchArray) => number; getMinutes: (m: RegExpMatchArray) => number}[] = [
  {
    regex: /\b(\d{1,2}):(\d{2})\s*(am|pm)\b/i,
    getHours: m => {
      let h = parseInt(m[1], 10);
      if (m[3].toLowerCase() === 'pm' && h !== 12) h += 12;
      if (m[3].toLowerCase() === 'am' && h === 12) h = 0;
      return h;
    },
    getMinutes: m => parseInt(m[2], 10),
  },
  {
    regex: /\b(\d{1,2})\s*(am|pm)\b/i,
    getHours: m => {
      let h = parseInt(m[1], 10);
      if (m[2].toLowerCase() === 'pm' && h !== 12) h += 12;
      if (m[2].toLowerCase() === 'am' && h === 12) h = 0;
      return h;
    },
    getMinutes: () => 0,
  },
];

const applyTime = (date: Date, text: string): {date: Date; hasTime: boolean} => {
  for (const p of TIME_PATTERNS) {
    const m = text.match(p.regex);
    if (m) {
      const result = setMinutes(setHours(date, p.getHours(m)), p.getMinutes(m));
      return {date: result, hasTime: true};
    }
  }
  return {date: startOfDay(date), hasTime: false};
};

export const parseSmartDate = (input: string): ParsedDate | null => {
  const text = input.toLowerCase().trim();
  const now = new Date();

  if (/\btoday\b/.test(text)) return applyTime(startOfDay(now), text);
  if (/\btomorrow\b/.test(text)) return applyTime(addDays(startOfDay(now), 1), text);
  if (/\byesterday\b/.test(text)) return applyTime(addDays(startOfDay(now), -1), text);
  if (/\bnext week\b/.test(text)) return applyTime(nextMonday(now), text);
  if (/\bnext month\b/.test(text)) return applyTime(addMonths(startOfDay(now), 1), text);

  if (/\bnext monday\b/.test(text)) return applyTime(nextMonday(now), text);
  if (/\bnext tuesday\b/.test(text)) return applyTime(nextTuesday(now), text);
  if (/\bnext wednesday\b/.test(text)) return applyTime(nextWednesday(now), text);
  if (/\bnext thursday\b/.test(text)) return applyTime(nextThursday(now), text);
  if (/\bnext friday\b/.test(text)) return applyTime(nextFriday(now), text);
  if (/\bnext saturday\b/.test(text)) return applyTime(nextSaturday(now), text);
  if (/\bnext sunday\b/.test(text)) return applyTime(nextSunday(now), text);

  const inMatch = text.match(/\bin (\d+) (minute|hour|day|week|month)s?\b/);
  if (inMatch) {
    const n = parseInt(inMatch[1], 10);
    const unit = inMatch[2];
    let date = new Date(now);
    if (unit === 'minute') date = addMinutes(date, n);
    else if (unit === 'hour') date = addHours(date, n);
    else if (unit === 'day') date = addDays(date, n);
    else if (unit === 'week') date = addWeeks(date, n);
    else if (unit === 'month') date = addMonths(date, n);
    return {date, hasTime: unit === 'minute' || unit === 'hour'};
  }

  const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) {
    const parsed = parseISO(isoMatch[1]);
    if (isValid(parsed)) return applyTime(parsed, text);
  }

  return null;
};

export const extractDateFromTitle = (
  title: string,
): {cleanTitle: string; date: Date | null; hasTime: boolean} => {
  const parsed = parseSmartDate(title);
  if (!parsed) return {cleanTitle: title, date: null, hasTime: false};
  return {cleanTitle: title, date: parsed.date, hasTime: parsed.hasTime};
};
