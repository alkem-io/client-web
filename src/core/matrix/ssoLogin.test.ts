import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearNamespace, storeCredentials } from './storage';

const HOMESERVER = 'https://matrix.dev-alkem.io';

// `@/main/env` snapshots window._env_ at import, so each test re-imports ssoLogin after setting it.
const setMatrixHomeserver = (url: string): void => {
  Object.defineProperty(window, '_env_', {
    value: { VITE_APP_MATRIX_HOMESERVER_URL: url },
    writable: true,
    configurable: true,
  });
};

describe('ssoLogin', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as unknown as Record<string, unknown>)._env_;
  });

  describe('attemptSilentSso', () => {
    const LOCALPART = 'silent-actor';
    const USER_ID = `@${LOCALPART}:matrix.dev-alkem.io`;

    afterEach(async () => {
      await clearNamespace(USER_ID);
    });

    it('does not create an iframe when Matrix is not configured for this environment', async () => {
      setMatrixHomeserver('');

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const result = await fresh(LOCALPART, { timeoutMs: 200, pollIntervalMs: 20 });

      expect(result).toBe('timeout');
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('resolves authenticated when the callback persists fresh credentials, then removes the iframe', async () => {
      setMatrixHomeserver(HOMESERVER);

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const attempt = fresh(LOCALPART, { timeoutMs: 2000, pollIntervalMs: 20 });

      await storeCredentials({
        userId: USER_ID,
        deviceId: 'DEV1',
        accessToken: 'syt_silent',
        homeserverUrl: HOMESERVER,
      });

      const result = await attempt;
      expect(result).toBe('authenticated');
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('times out and resolves timeout when no credentials appear', async () => {
      setMatrixHomeserver(HOMESERVER);

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const result = await fresh(LOCALPART, { timeoutMs: 100, pollIntervalMs: 20 });

      expect(result).toBe('timeout');
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('points the hidden iframe at the SSO redirect URL, with no idp id', async () => {
      setMatrixHomeserver(HOMESERVER);

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const abort = new AbortController();
      const attempt = fresh(LOCALPART, { timeoutMs: 10_000, pollIntervalMs: 20, signal: abort.signal });
      await vi.waitFor(() => {
        expect(document.querySelector('iframe')).not.toBeNull();
      });

      const iframe = document.querySelector('iframe');
      expect(iframe?.src).toContain(`${HOMESERVER}/_matrix/client/v3/login/sso/redirect?redirectUrl=`);
      expect(iframe?.src).not.toContain('/sso/redirect/');
      expect(iframe?.src).toContain(encodeURIComponent(`${window.location.origin}/matrix-callback`));
      expect(iframe?.style.display).toBe('none');

      abort.abort();
      await attempt;
    });

    it('an abort removes the iframe at once and resolves timeout', async () => {
      setMatrixHomeserver(HOMESERVER);

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const abort = new AbortController();
      const attempt = fresh(LOCALPART, { timeoutMs: 10_000, pollIntervalMs: 20, signal: abort.signal });
      await vi.waitFor(() => {
        expect(document.querySelector('iframe')).not.toBeNull();
      });

      abort.abort();
      // Synchronous: the frame's callback must not get another tick to persist credentials.
      expect(document.querySelector('iframe')).toBeNull();
      expect(await attempt).toBe('timeout');
    });

    it('does nothing when already aborted — no iframe', async () => {
      setMatrixHomeserver(HOMESERVER);
      const abort = new AbortController();
      abort.abort();

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      expect(await fresh(LOCALPART, { signal: abort.signal })).toBe('timeout');
      expect(document.querySelector('iframe')).toBeNull();
    });
  });
});
