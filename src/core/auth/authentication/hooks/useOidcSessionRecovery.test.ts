import { describe, expect, it } from 'vitest';
import { shouldRecoverOidcSession } from './useOidcSessionRecovery';

// Baseline = the bug case: Kratos SSO alive, BFF session dropped (post password
// change), returning user, on a normal route, not yet attempted → should recover.
const baseInput = {
  loading: false,
  kratosAuthenticated: true,
  oidcActive: false,
  pathname: '/home',
  sessionPreviouslySeen: true,
  recoveryAlreadyAttempted: false,
} as const;

describe('shouldRecoverOidcSession', () => {
  it('recovers when Kratos SSO is alive but the BFF session dropped for a returning user', () => {
    expect(shouldRecoverOidcSession(baseInput)).toBe(true);
  });

  it('waits while either session probe is still loading', () => {
    expect(shouldRecoverOidcSession({ ...baseInput, loading: true })).toBe(false);
  });

  it('does nothing when the BFF session is already active', () => {
    expect(shouldRecoverOidcSession({ ...baseInput, oidcActive: true })).toBe(false);
  });

  it('does not attempt a silent login without a live Kratos SSO session', () => {
    expect(shouldRecoverOidcSession({ ...baseInput, kratosAuthenticated: false })).toBe(false);
  });

  it('does not force-login an anonymous visitor carrying another RP SSO cookie', () => {
    expect(shouldRecoverOidcSession({ ...baseInput, sessionPreviouslySeen: false })).toBe(false);
  });

  it('attempts recovery at most once per tab (loop guard)', () => {
    expect(shouldRecoverOidcSession({ ...baseInput, recoveryAlreadyAttempted: true })).toBe(false);
  });

  it.each([
    'login',
    'logout',
    'registration',
    'sign_up',
    'verify',
    'recovery',
    'required',
    'error',
    'settings',
  ])('never fires on the /%s auth route (mismatch is by design there)', segment => {
    expect(shouldRecoverOidcSession({ ...baseInput, pathname: `/${segment}` })).toBe(false);
    expect(shouldRecoverOidcSession({ ...baseInput, pathname: `/${segment}?flow=abc` })).toBe(false);
  });

  it('fires on a nested non-auth route', () => {
    expect(shouldRecoverOidcSession({ ...baseInput, pathname: '/spaces/foo/dashboard' })).toBe(true);
  });
});
