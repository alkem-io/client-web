import { addDays, addMinutes } from 'date-fns';

const MINUTES_PER_DAY = 24 * 60;

/**
 * Computes the end instant of a calendar event from its start + duration.
 *
 * `durationMinutes` is the **full** event span. The server treats it as
 * authoritative — its `calculateCalendarEventEndDate` documents that
 * "durationMinutes always holds the full event duration, including days converted
 * to minutes". `durationDays` is a derived convenience field (`floor(minutes /
 * 1440)`) and must NOT be added on top: doing so double-counts the days, so a
 * 2-day span rendered as 4 days and the calendar lit up 5 cells instead of 3.
 *
 * The span is split back into whole days + a sub-day remainder so the day part is
 * applied with `addDays` — calendar-correct across DST transitions — while the
 * remainder is added as minutes.
 *
 * @returns start + `durationMinutes`, computed DST-safely.
 */
export function endDateFromDuration(startDate: Date, durationMinutes: number): Date {
  const total = durationMinutes ?? 0;
  return addMinutes(addDays(startDate, Math.floor(total / MINUTES_PER_DAY)), total % MINUTES_PER_DAY);
}
