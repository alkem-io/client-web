import { differenceInCalendarDays } from 'date-fns';

/**
 * Whole-day calendar events are bare calendar dates, not instants. Their
 * canonical wire/storage value is UTC-midnight of the intended date, so a
 * whole-day event reads as the same calendar day for every timezone. These
 * helpers are the single place that encodes/decodes that convention — keep the
 * math here and out of call sites.
 */

/**
 * Local picked calendar date → whole-day wire value: UTC-midnight of that day's
 * local Y-M-D. Discards the browser offset and any time-of-day, so "3 Dec" is
 * sent as `2026-12-03T00:00:00.000Z` regardless of the creator's timezone.
 */
export const toWholeDayWire = (local: Date): Date =>
  new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));

/**
 * Stored whole-day UTC-midnight → a local "floating" Date whose local Y-M-D
 * equals the intended date. This lets existing local-timezone display code
 * (date-fns `format`/`startOfDay`) render the correct day for any viewer.
 */
export const fromWholeDayWire = (iso: string | Date): Date => {
  const utc = new Date(iso);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
};

/**
 * Whole-day span in minutes = (end day − start day) × 1440 — zero for a single day.
 * A whole-day event has no time-of-day, so its length is a pure function of the date
 * range. Uses a calendar-day diff so the result is exact (a clean multiple of 1440)
 * and DST-safe; returns 0 when either date is missing.
 */
export const wholeDaySpanMinutes = (start: Date | undefined, end: Date | undefined): number =>
  start && end ? Math.max(0, differenceInCalendarDays(end, start)) * 24 * 60 : 0;
