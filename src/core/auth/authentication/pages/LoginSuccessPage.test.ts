import { describe, expect, it } from 'vitest';
import { resolveLoginSuccessAction } from './LoginSuccessPage';

const base = {
  loading: false,
  hasUserModel: false,
  oidcActive: false,
  hasKratosSession: false,
  reentryAlreadyAttempted: false,
};

describe('resolveLoginSuccessAction', () => {
  it('waits while the session probes or the profile query are still resolving', () => {
    expect(resolveLoginSuccessAction({ ...base, loading: true })).toBe('wait');
    expect(resolveLoginSuccessAction({ ...base, loading: true, hasUserModel: true })).toBe('wait');
  });

  it('navigates to the return destination once the profile is loaded (the normal OIDC login)', () => {
    expect(resolveLoginSuccessAction({ ...base, hasUserModel: true, oidcActive: true, hasKratosSession: true })).toBe(
      'navigate'
    );
  });

  it('re-enters the BFF OIDC login when a Kratos-native login ended here without a BFF session (account linking)', () => {
    expect(resolveLoginSuccessAction({ ...base, hasKratosSession: true })).toBe('oidc-reentry');
  });

  it('does not re-enter when the BFF session is already live — there is nothing to recover', () => {
    expect(resolveLoginSuccessAction({ ...base, oidcActive: true, hasKratosSession: true })).toBe('navigate');
  });

  it('does not loop: past the one re-entry attempt it navigates on instead of bouncing again', () => {
    expect(resolveLoginSuccessAction({ ...base, hasKratosSession: true, reentryAlreadyAttempted: true })).toBe(
      'navigate'
    );
  });

  it('navigates a fully anonymous visitor away rather than leaving a dead blank page', () => {
    expect(resolveLoginSuccessAction(base)).toBe('navigate');
  });
});
