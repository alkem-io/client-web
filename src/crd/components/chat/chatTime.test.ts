import { describe, expect, test } from 'vitest';
import { createChatTimeFormat } from './chatTime';

const NOW = new Date(2026, 9, 14, 15, 0).getTime();
const at = (year: number, month: number, day: number, hours: number, minutes: number) =>
  new Date(year, month, day, hours, minutes).getTime();

describe('createChatTimeFormat', () => {
  test('clock time follows the locale: 24h for en-GB, 12h for en-US', () => {
    const ms = at(2026, 9, 14, 14, 32);
    expect(createChatTimeFormat('en-GB', NOW).clock(ms)).toBe('14:32');
    expect(createChatTimeFormat('en-US', NOW).clock(ms)).toMatch(/^2:32\sPM$/);
  });

  test('today and yesterday are named, capitalised, in the locale', () => {
    const format = createChatTimeFormat('en-GB', NOW);
    expect(format.day(at(2026, 9, 14, 0, 5))).toBe('Today');
    expect(format.day(at(2026, 9, 13, 23, 55))).toBe('Yesterday');
    const nl = createChatTimeFormat('nl', NOW);
    expect(nl.day(at(2026, 9, 14, 9, 0))).toBe('Vandaag');
    expect(nl.day(at(2026, 9, 13, 9, 0))).toBe('Gisteren');
  });

  test('older days show weekday, day and month, without the year in the current year', () => {
    const format = createChatTimeFormat('en-GB', NOW);
    expect(format.day(at(2026, 9, 5, 9, 0))).toBe('Monday 5 October');
  });

  test('the year is added only when it is not the current year', () => {
    const format = createChatTimeFormat('en-GB', NOW);
    expect(format.day(at(2025, 9, 6, 9, 0))).toBe('Monday, 6 October 2025');
  });

  test('exact time joins the day and the clock time', () => {
    const format = createChatTimeFormat('en-GB', NOW);
    expect(format.exact(at(2026, 9, 14, 9, 12))).toBe('Today, 09:12');
  });
});
