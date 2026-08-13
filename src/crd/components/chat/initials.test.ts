import { describe, expect, test } from 'vitest';
import { initials } from './initials';

describe('initials', () => {
  test('first letter of the first two words, uppercased', () => {
    expect(initials('Jane Doe')).toBe('JD');
    expect(initials('jane')).toBe('J');
    expect(initials('Anna Maria van der Berg')).toBe('AM');
  });

  test('trims and collapses whitespace', () => {
    expect(initials('  Jane   Doe  ')).toBe('JD');
  });

  test('empty or blank input falls back to ?', () => {
    expect(initials('')).toBe('?');
    expect(initials('   ')).toBe('?');
  });

  test('astral-plane first characters stay whole code points, not half-surrogates', () => {
    expect(initials('𝕏 Corp')).toBe('𝕏C');
    expect(initials('😀 Team')).toBe('😀T');
  });
});
