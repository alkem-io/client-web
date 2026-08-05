import { describe, expect, it } from 'vitest';
import { isDownNoticeExpired } from './useDownNoticeBanner';

const at = (iso: string) => Date.parse(iso);

describe('isDownNoticeExpired', () => {
  it('shows the notice before the maintenance window', () => {
    expect(isDownNoticeExpired(at('2026-07-30T12:00:00Z'))).toBe(false);
  });

  it('still shows it during the window (21:00 CEST on 31 July)', () => {
    expect(isDownNoticeExpired(at('2026-07-31T19:00:00Z'))).toBe(false);
  });

  it('still shows it one minute before midnight CEST', () => {
    expect(isDownNoticeExpired(at('2026-07-31T21:59:00Z'))).toBe(false);
  });

  it('hides it from midnight CEST on 1 August', () => {
    expect(isDownNoticeExpired(at('2026-07-31T22:00:00Z'))).toBe(true);
  });

  it('stays hidden on 1 August and after', () => {
    expect(isDownNoticeExpired(at('2026-08-01T09:00:00Z'))).toBe(true);
    expect(isDownNoticeExpired(at('2026-09-01T09:00:00Z'))).toBe(true);
  });
});
