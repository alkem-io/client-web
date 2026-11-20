import { describe, expect, it } from 'vitest';
import { claimEscape } from './claimEscape';

const keydown = (key: string) => new KeyboardEvent('keydown', { key, cancelable: true });

describe('claimEscape', () => {
  it('ignores any key other than Escape and leaves it unclaimed', () => {
    const event = keydown('Enter');
    expect(claimEscape(event)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });

  it('skips an Escape a higher layer already handled', () => {
    const event = keydown('Escape');
    event.preventDefault();
    expect(claimEscape(event)).toBe(false);
  });

  it('claims a fresh Escape', () => {
    const event = keydown('Escape');
    expect(claimEscape(event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });
});
