import { addDays, addMinutes } from 'date-fns';

/**
 * Computes the end instant of a calendar event from its start + duration.
 *
 * Calendar events carry duration as TWO independent fields:
 *   - `durationDays`   — whole-day spans (e.g. a 3-day workshop)
 *   - `durationMinutes` — sub-day offset (e.g. a 90-minute meeting)
 *
 * They can both be non-zero (e.g. a 1-day-and-2-hours event) and they are
 * additive. Earlier code in this feature derived endDate from `durationMinutes`
 * alone, which broke any event whose span was carried by `durationDays`:
 *   - Multi-day all-day events collapsed to a single-day marker on the calendar.
 *   - Multi-day timed events showed only the start day in the badge / list.
 *   - The batch ICS exporter wrote a same-day DTEND for them.
 *
 * Centralising the calculation here means a single place computes the true
 * end-instant; every consumer (badge, header, calendar buckets, ICS exporter)
 * uses the same formula.
 *
 * @returns A new `Date` representing the start instant + (durationDays days) +
 *          (durationMinutes minutes). `addDays` is applied first because it
 *          respects calendar days under DST transitions.
 */
export function endDateFromDuration(startDate: Date, durationMinutes: number, durationDays?: number): Date {
  const days = durationDays ?? 0;
  const minutes = durationMinutes ?? 0;
  return addMinutes(addDays(startDate, days), minutes);
}
