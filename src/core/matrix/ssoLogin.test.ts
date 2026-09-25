import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CALLBACK_ROUTE,
  clearSsoFlowState,
  discoverIdp,
  loadSsoFlowState,
  PENDING_SSO_KEY,
  saveSsoFlowState,
} from './ssoLogin';
import { clearNamespace, storeCredentials } from './storage';

const HOMESERVER = 'https://matrix.dev-alkem.io';

const makeLoginResponse = (providers: { id: string }[] = [{ id: 'test-idp' }]) => ({
  flows: [{ type: 'm.login.password' }, { type: 'm.login.sso', identity_providers: providers }],
});

describe('ssoLogin', () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as unknown as Record<string, unknown>)._env_;
    sessionStorage.clear();
  });

  describe('discoverIdp', () => {
    it('extracts idp id from a single-provider response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(makeLoginResponse()), { status: 200 })
      );

      const result = await discoverIdp(HOMESERVER);
      expect(result.ok).toBe(true);
      expect(result.idpId).toBe('test-idp');
    });

    it('fails on zero providers', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(makeLoginResponse([])), { status: 200 })
      );

      const result = await discoverIdp(HOMESERVER);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('zero');
    });

    it('fails on two providers (no guess)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(makeLoginResponse([{ id: 'idp-a' }, { id: 'idp-b' }])), { status: 200 })
      );

      const result = await discoverIdp(HOMESERVER);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('2');
    });

    it('fails when m.login.sso flow is missing', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ flows: [{ type: 'm.login.password' }] }), { status: 200 })
      );

      const result = await discoverIdp(HOMESERVER);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('no m.login.sso');
    });

    it('fails on non-200 response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('', { status: 500 }));

      const result = await discoverIdp(HOMESERVER);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('500');
    });

    it('returns ok:false instead of rejecting when the login endpoint is unreachable', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await discoverIdp(HOMESERVER);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('unreachable');
    });

    it('does not pass credentials to the homeserver', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(makeLoginResponse()), { status: 200 }));

      await discoverIdp(HOMESERVER);

      const [, init] = fetchSpy.mock.calls[0];
      expect(init?.credentials).toBe('omit');
    });

    it("hands the caller's abort signal to fetch and reports an abort as unreachable", async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
        (_url, init) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
          })
      );
      const controller = new AbortController();

      const pending = discoverIdp(HOMESERVER, controller.signal);
      controller.abort();
      const result = await pending;

      expect(fetchSpy.mock.calls[0][1]?.signal).toBe(controller.signal);
      expect(result.ok).toBe(false);
      expect(result.unreachable).toBe(true);
    });
  });

  describe('attemptSilentSso', () => {
    const setEnv = (extra: Record<string, string> = {}) => {
      Object.defineProperty(window, '_env_', {
        value: {
          VITE_APP_MATRIX_ENABLED: 'true',
          VITE_APP_MATRIX_HOMESERVER_URL: HOMESERVER,
          VITE_APP_MATRIX_ALLOWED_USERS: '',
          ...extra,
        },
        writable: true,
        configurable: true,
      });
    };
    const LOCALPART = 'silent-actor';
    const USER_ID = `@${LOCALPART}:matrix.dev-alkem.io`;

    afterEach(async () => {
      await clearNamespace(USER_ID);
    });

    it('does not create an iframe when matrix is disabled', async () => {
      Object.defineProperty(window, '_env_', {
        value: { VITE_APP_MATRIX_ENABLED: 'false', VITE_APP_MATRIX_HOMESERVER_URL: HOMESERVER },
        writable: true,
        configurable: true,
      });

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const result = await fresh(LOCALPART, { timeoutMs: 200, pollIntervalMs: 20 });

      expect(result).toBe('unavailable');
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('resolves authenticated when the callback persists fresh credentials, then removes the iframe', async () => {
      setEnv();
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(makeLoginResponse()), { status: 200 })
      );

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const attempt = fresh(LOCALPART, { timeoutMs: 2000, pollIntervalMs: 20 });

      await storeCredentials({
        userId: USER_ID,
        deviceId: 'DEV1',
        accessToken: 'syt_silent',
        refreshToken: 'syr_silent',
        expiresAt: Date.now() + 60_000,
        homeserverUrl: HOMESERVER,
        storedAt: Date.now(),
      });

      const result = await attempt;
      expect(result).toBe('authenticated');
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('times out and resolves timeout when no credentials appear', async () => {
      setEnv();
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(makeLoginResponse()), { status: 200 })
      );

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const result = await fresh(LOCALPART, { timeoutMs: 100, pollIntervalMs: 20 });

      expect(result).toBe('timeout');
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('resolves unreachable without creating an iframe when the login endpoint is down', async () => {
      setEnv();
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const result = await fresh(LOCALPART, { timeoutMs: 200, pollIntervalMs: 20 });

      expect(result).toBe('unreachable');
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('resolves unreachable within the timeout when discovery never answers — no iframe, no hang', async () => {
      setEnv();
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
        (_url, init) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
          })
      );

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const startedAt = Date.now();
      const result = await fresh(LOCALPART, { timeoutMs: 100, pollIntervalMs: 20 });

      expect(result).toBe('unreachable');
      expect(Date.now() - startedAt).toBeLessThan(1_000);
      expect(fetchSpy.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('resolves unreachable on a 5xx from the login endpoint', async () => {
      setEnv();
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('', { status: 502 }));

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const result = await fresh(LOCALPART, { timeoutMs: 200, pollIntervalMs: 20 });

      expect(result).toBe('unreachable');
    });

    it('resolves unavailable on an SSO misconfiguration (zero providers) — no retry signal', async () => {
      setEnv();
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(makeLoginResponse([])), { status: 200 })
      );

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const result = await fresh(LOCALPART, { timeoutMs: 200, pollIntervalMs: 20 });

      expect(result).toBe('unavailable');
    });

    it('points the hidden iframe at the SSO redirect URL for the discovered idp', async () => {
      setEnv();
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(makeLoginResponse()), { status: 200 })
      );

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const abort = new AbortController();
      const attempt = fresh(LOCALPART, { timeoutMs: 10_000, pollIntervalMs: 20, signal: abort.signal });
      await vi.waitFor(() => {
        expect(document.querySelector('iframe')).not.toBeNull();
      });

      const iframe = document.querySelector('iframe');
      expect(iframe?.src).toContain('/_matrix/client/v3/login/sso/redirect/test-idp');
      expect(iframe?.src).toContain(encodeURIComponent(`${window.location.origin}${CALLBACK_ROUTE}`));
      expect(iframe?.style.display).toBe('none');
      // The callback rejects any token this tab did not ask for.
      expect(sessionStorage.getItem(PENDING_SSO_KEY)).not.toBeNull();

      abort.abort();
      await attempt;
    });

    it('an abort removes the iframe at once and resolves unavailable', async () => {
      setEnv();
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(makeLoginResponse()), { status: 200 })
      );

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const abort = new AbortController();
      const attempt = fresh(LOCALPART, { timeoutMs: 10_000, pollIntervalMs: 20, signal: abort.signal });
      await vi.waitFor(() => {
        expect(document.querySelector('iframe')).not.toBeNull();
      });

      abort.abort();
      // Synchronous: the frame's callback must not get another tick to persist credentials.
      expect(document.querySelector('iframe')).toBeNull();
      expect(await attempt).toBe('unavailable');
    });

    it('does nothing when already aborted — no discovery, no iframe', async () => {
      setEnv();
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const abort = new AbortController();
      abort.abort();

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      expect(await fresh(LOCALPART, { signal: abort.signal })).toBe('unavailable');
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('does not attempt SSO from an origin other than the platform origin', async () => {
      setEnv({ VITE_APP_ALKEMIO_DOMAIN: 'https://sandbox-alkem.io' });
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      expect(await fresh(LOCALPART)).toBe('unavailable');
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('attempts SSO on the platform origin (trailing slash tolerated)', async () => {
      setEnv({ VITE_APP_ALKEMIO_DOMAIN: `${window.location.origin}/` });
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(makeLoginResponse([])), { status: 200 })
      );

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      expect(await fresh(LOCALPART)).toBe('unavailable');
      expect(globalThis.fetch).toHaveBeenCalledOnce();
    });
  });

  describe('flow state persistence', () => {
    it('round-trips save → load → clear', () => {
      saveSsoFlowState();

      const loaded = loadSsoFlowState();
      expect(loaded).not.toBeNull();
      expect(loaded?.startedAt).toBeGreaterThan(0);

      clearSsoFlowState();
      expect(loadSsoFlowState()).toBeNull();
    });
  });
});
