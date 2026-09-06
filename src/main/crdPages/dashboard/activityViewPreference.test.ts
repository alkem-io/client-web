import { describe, expect, it } from 'vitest';
import { resolveActivityView, shouldSeedFromLegacy } from './activityViewPreference';

describe('resolveActivityView', () => {
  it('defaults to Activity view on when nothing is set (FR-024)', () => {
    expect(resolveActivityView(null, undefined)).toBe(true);
    expect(resolveActivityView(null, null)).toBe(true);
  });

  it('uses the persisted account setting when there is no local override', () => {
    expect(resolveActivityView(null, false)).toBe(false);
    expect(resolveActivityView(null, true)).toBe(true);
  });

  it('lets a local override win over the setting (instant toggle feedback)', () => {
    expect(resolveActivityView(false, true)).toBe(false);
    expect(resolveActivityView(true, false)).toBe(true);
  });
});

describe('shouldSeedFromLegacy (FR-026)', () => {
  it('seeds the non-activity view when the legacy device choice was SPACES and no account value exists', () => {
    expect(shouldSeedFromLegacy('SPACES', undefined)).toBe(true);
    expect(shouldSeedFromLegacy('SPACES', null)).toBe(true);
    expect(shouldSeedFromLegacy('SPACES', true)).toBe(true);
  });

  it('does not re-seed when the account already prefers the non-activity view', () => {
    expect(shouldSeedFromLegacy('SPACES', false)).toBe(false);
  });

  it('does not seed for an ACTIVITY / missing legacy value (already the default)', () => {
    expect(shouldSeedFromLegacy('ACTIVITY', undefined)).toBe(false);
    expect(shouldSeedFromLegacy(null, undefined)).toBe(false);
  });
});
