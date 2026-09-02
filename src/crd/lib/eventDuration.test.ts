import { describe, expect, it } from 'vitest';
import { endDateFromDuration } from './eventDuration';

describe('endDateFromDuration', () => {
  it('treats durationMinutes as the full span (a 2-day event ends 2 days later, not 4)', () => {
    const start = new Date(2026, 6, 23); // 23 Jul 2026, local
    const end = endDateFromDuration(start, 2880); // 2 days
    expect([end.getFullYear(), end.getMonth(), end.getDate()]).toEqual([2026, 6, 25]);
  });

  it('adds a sub-day duration as minutes', () => {
    const start = new Date(2026, 6, 23, 10, 0);
    const end = endDateFromDuration(start, 90);
    expect([end.getHours(), end.getMinutes()]).toEqual([11, 30]);
  });

  it('is DST-safe: a 2-day span across the spring-forward stays 2 calendar days', () => {
    // Europe spring-forward 2026 is 29 March; addDays keeps the calendar day.
    const start = new Date(2026, 2, 28); // 28 Mar, local
    const end = endDateFromDuration(start, 2880);
    expect([end.getMonth(), end.getDate()]).toEqual([2, 30]); // 30 Mar, not 29
  });

  it('returns the start for a zero-length (single-day) event', () => {
    const start = new Date(2026, 6, 23);
    expect(endDateFromDuration(start, 0).getTime()).toBe(start.getTime());
  });
});
