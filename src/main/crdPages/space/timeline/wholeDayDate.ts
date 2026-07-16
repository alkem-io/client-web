/**
 * Whole-day calendar events are bare calendar dates, not instants. Their
 * canonical wire/storage value is UTC-midnight of the intended date, so a
 * whole-day event reads as the same calendar day for every timezone. These two
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
