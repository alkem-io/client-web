import dayjs from 'dayjs';
import { describe, expect, test } from 'vitest';
import { escapeIcsText, foldLine, formatDateTimeUtc } from './icsUtils';

// ─── foldLine ────────────────────────────────────────────────────────────────

describe('foldLine', () => {
  const encoder = new TextEncoder();

  test('returns short lines unchanged', () => {
    const line = 'SUMMARY:Short title';
    expect(foldLine(line)).toBe(line);
  });

  test('returns a line of exactly 75 bytes unchanged', () => {
    // "SUMMARY:" = 8 bytes, pad the rest to reach exactly 75
    const line = 'SUMMARY:' + 'x'.repeat(67); // 8 + 67 = 75
    expect(encoder.encode(line).length).toBe(75);
    expect(foldLine(line)).toBe(line);
  });

  test('folds a line of 76 ASCII bytes', () => {
    const line = 'SUMMARY:' + 'x'.repeat(68); // 76 bytes
    const folded = foldLine(line);

    // First segment must be ≤ 75 bytes
    const segments = folded.split('\r\n ');
    expect(segments.length).toBe(2);
    expect(encoder.encode(segments[0]).length).toBeLessThanOrEqual(75);
    // Continuation segment (without the leading space) ≤ 74 bytes
    expect(encoder.encode(segments[1]).length).toBeLessThanOrEqual(74);
  });

  test('folds a long ASCII line into multiple continuation lines', () => {
    const line = 'DESCRIPTION:' + 'A'.repeat(200);
    const folded = foldLine(line);

    const segments = folded.split('\r\n ');
    expect(segments.length).toBeGreaterThan(2);

    // First line ≤ 75 bytes
    expect(encoder.encode(segments[0]).length).toBeLessThanOrEqual(75);
    // Every continuation line ≤ 74 bytes
    for (let i = 1; i < segments.length; i++) {
      expect(encoder.encode(segments[i]).length).toBeLessThanOrEqual(74);
    }

    // Unfolding must reproduce the original line
    const unfolded = folded.replace(/\r\n /g, '');
    expect(unfolded).toBe(line);
  });

  test('handles empty string', () => {
    expect(foldLine('')).toBe('');
  });

  test('never splits a multi-byte character across fold boundaries', () => {
    // Each emoji (e.g. 🎉) is 4 UTF-8 bytes.
    // Fill up to near the fold point with ASCII, then place emoji right at the boundary.
    const prefix = 'SUMMARY:' + 'a'.repeat(63); // 71 bytes
    // Next char is a 4-byte emoji → 71 + 4 = 75 still fits on first line
    const line = prefix + '🎉' + 'b'.repeat(10);

    const folded = foldLine(line);
    const segments = folded.split('\r\n ');

    // First segment should contain the emoji intact (71 + 4 = 75 ≤ 75)
    expect(segments[0]).toContain('🎉');
    expect(encoder.encode(segments[0]).length).toBeLessThanOrEqual(75);
  });

  test('folds emoji that would exceed the 75-byte boundary', () => {
    // 73 ASCII bytes + 4-byte emoji = 77 → emoji must go to continuation line
    const prefix = 'SUMMARY:' + 'a'.repeat(65); // 73 bytes
    const line = prefix + '🎉' + 'b'.repeat(5);

    const folded = foldLine(line);
    const segments = folded.split('\r\n ');

    expect(segments.length).toBeGreaterThanOrEqual(2);
    // First segment must not exceed 75 bytes
    expect(encoder.encode(segments[0]).length).toBeLessThanOrEqual(75);
    // Emoji ends up in a continuation segment
    expect(segments.slice(1).join('')).toContain('🎉');
  });

  test('handles lines with mixed multi-byte characters (accented, CJK, emoji)', () => {
    // é = 2 bytes, 中 = 3 bytes, 🌍 = 4 bytes
    const line = 'DESCRIPTION:' + 'é'.repeat(20) + '中'.repeat(10) + '🌍'.repeat(5) + 'end';

    const folded = foldLine(line);
    const segments = folded.split('\r\n ');

    for (let i = 0; i < segments.length; i++) {
      const limit = i === 0 ? 75 : 74;
      expect(encoder.encode(segments[i]).length).toBeLessThanOrEqual(limit);
    }

    // Unfolding reproduces the original
    expect(folded.replace(/\r\n /g, '')).toBe(line);
  });

  test('all segments respect byte limits for a very long description', () => {
    const line = 'DESCRIPTION:' + 'The quick brown fox jumps over the lazy dog. '.repeat(20);
    const folded = foldLine(line);
    const segments = folded.split('\r\n ');

    expect(encoder.encode(segments[0]).length).toBeLessThanOrEqual(75);
    for (let i = 1; i < segments.length; i++) {
      expect(encoder.encode(segments[i]).length).toBeLessThanOrEqual(74);
    }

    expect(folded.replace(/\r\n /g, '')).toBe(line);
  });
});

// ─── escapeIcsText ───────────────────────────────────────────────────────────

describe('escapeIcsText', () => {
  test('escapes backslashes', () => {
    expect(escapeIcsText('path\\to\\file')).toBe('path\\\\to\\\\file');
  });

  test('escapes semicolons', () => {
    expect(escapeIcsText('a;b;c')).toBe('a\\;b\\;c');
  });

  test('escapes commas', () => {
    expect(escapeIcsText('one,two,three')).toBe('one\\,two\\,three');
  });

  test('escapes newlines', () => {
    expect(escapeIcsText('line1\nline2')).toBe('line1\\nline2');
  });

  test('escapes all special characters together', () => {
    expect(escapeIcsText('a\\b;c,d\ne')).toBe('a\\\\b\\;c\\,d\\ne');
  });

  test('returns plain text unchanged', () => {
    const plain = 'Hello World';
    expect(escapeIcsText(plain)).toBe(plain);
  });
});

// ─── formatDateTimeUtc ───────────────────────────────────────────────────────

describe('formatDateTimeUtc', () => {
  test('formats a known date as ICS UTC timestamp', () => {
    // 2026-03-05T14:30:00.000Z → 20260305T143000Z
    const date = dayjs('2026-03-05T14:30:00.000Z');
    expect(formatDateTimeUtc(date)).toBe('20260305T143000Z');
  });

  test('formats midnight correctly', () => {
    const date = dayjs('2026-01-01T00:00:00.000Z');
    expect(formatDateTimeUtc(date)).toBe('20260101T000000Z');
  });

  test('formats end-of-day correctly', () => {
    const date = dayjs('2025-12-31T23:59:59.000Z');
    expect(formatDateTimeUtc(date)).toBe('20251231T235959Z');
  });

  test('output contains no dashes or colons', () => {
    const date = dayjs('2026-06-15T09:05:03.000Z');
    const result = formatDateTimeUtc(date);
    expect(result).not.toContain('-');
    expect(result).not.toContain(':');
    expect(result).not.toContain('.');
  });
});
