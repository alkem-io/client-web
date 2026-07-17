import { describe, expect, it } from 'vitest';
import { deriveEventWireFields } from './useCalendarEvents';

// The mutation boundary anchors whole-day dates to UTC-midnight and derives the
// duration from the full span. These assertions are TZ-independent by construction
// (a locally-picked date's calendar day → UTC-midnight of that day).
describe('deriveEventWireFields', () => {
  it('anchors whole-day start/end to UTC-midnight of the picked calendar day', () => {
    const wire = deriveEventWireFields({
      startDate: new Date(2026, 11, 3), // local 3 Dec
      endDate: new Date(2026, 11, 4), // local 4 Dec
      wholeDay: true,
      durationMinutes: 0,
    });

    expect(wire.startDate.toISOString()).toBe('2026-12-03T00:00:00.000Z');
    expect(wire.durationMinutes).toBe(1440);
    expect(wire.durationDays).toBe(1);
    expect(wire.multipleDays).toBe(true);
  });

  it('gives a whole-day multi-day span an exact whole-day duration', () => {
    const wire = deriveEventWireFields({
      startDate: new Date(2026, 11, 3),
      endDate: new Date(2026, 11, 5),
      wholeDay: true,
      durationMinutes: 0,
    });

    expect(wire.durationMinutes % 1440).toBe(0);
    expect(wire.durationDays).toBe(2);
  });

  it('leaves a timed event as its real instant (no anchoring)', () => {
    const start = new Date(2026, 11, 3, 14, 0);
    const wire = deriveEventWireFields({
      startDate: start,
      endDate: new Date(2026, 11, 3, 15, 0),
      wholeDay: false,
      durationMinutes: 60,
    });

    expect(wire.startDate.getTime()).toBe(start.getTime());
    expect(wire.durationMinutes).toBe(60); // same day → keeps the provided value
  });

  it('keeps a single-day event single-day (no derived duration)', () => {
    const wire = deriveEventWireFields({
      startDate: new Date(2026, 11, 3),
      endDate: new Date(2026, 11, 3),
      wholeDay: true,
      durationMinutes: 0,
    });

    expect(wire.durationDays).toBe(0);
    expect(wire.multipleDays).toBe(false);
  });
});
