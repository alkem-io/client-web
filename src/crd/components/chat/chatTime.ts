import { differenceInCalendarDays, isSameYear } from 'date-fns';

export type ChatTimeFormat = {
  /** "Today", "Yesterday", "Monday 5 October", "Monday 6 October 2025". */
  day: (ms: number) => string;
  /** Clock time in the locale's own format: "14:32" or "2:32 PM". */
  clock: (ms: number) => string;
  /** Day and clock time together: "Today, 09:12". */
  exact: (ms: number) => string;
};

/**
 * Chat timestamps in the reader's locale. The browser's Intl data supplies the
 * localised words ("Today", weekday and month names) and the 12/24-hour choice
 * for any regional locale (en-GB vs en-US), so no copy has to be maintained
 * here; date-fns does the calendar arithmetic. `locale` undefined means the
 * browser default.
 */
export function createChatTimeFormat(locale: string | undefined, now: number = Date.now()): ChatTimeFormat {
  const clockFormat = new Intl.DateTimeFormat(locale, { timeStyle: 'short' });
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const dateFormat = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  const dateWithYearFormat = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const capitalise = (text: string) => text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);

  const day = (ms: number) => {
    const daysAgo = differenceInCalendarDays(now, ms);
    if (daysAgo === 0 || daysAgo === 1) {
      return capitalise(relative.format(-daysAgo, 'day'));
    }
    return (isSameYear(now, ms) ? dateFormat : dateWithYearFormat).format(ms);
  };
  const clock = (ms: number) => clockFormat.format(ms);

  return { day, clock, exact: ms => `${day(ms)}, ${clock(ms)}` };
}
