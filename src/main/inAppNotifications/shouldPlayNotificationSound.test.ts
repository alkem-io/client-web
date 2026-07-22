import { describe, expect, it } from 'vitest';
import { shouldPlayNotificationSound } from './shouldPlayNotificationSound';

describe('shouldPlayNotificationSound', () => {
  it('does not play on the first observed value (no previous count)', () => {
    expect(shouldPlayNotificationSound(null, 3, true)).toBe(false);
    expect(shouldPlayNotificationSound(null, 0, true)).toBe(false);
  });

  it('plays on a strict increase', () => {
    expect(shouldPlayNotificationSound(2, 3, true)).toBe(true);
    expect(shouldPlayNotificationSound(0, 1, true)).toBe(true);
  });

  it('does not play on a decrease (count drops when notifications are read)', () => {
    expect(shouldPlayNotificationSound(5, 2, true)).toBe(false);
    expect(shouldPlayNotificationSound(1, 0, true)).toBe(false);
  });

  it('does not play when the count is unchanged', () => {
    expect(shouldPlayNotificationSound(4, 4, true)).toBe(false);
  });

  it('does not play when the preference is off, even on an increase', () => {
    expect(shouldPlayNotificationSound(2, 3, false)).toBe(false);
  });
});
