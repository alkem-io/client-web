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

    it('does not pass credentials to the homeserver (D-06)', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(makeLoginResponse()), { status: 200 }));

      await discoverIdp(HOMESERVER);

      const [, init] = fetchSpy.mock.calls[0];
      expect(init?.credentials).toBe('omit');
    });
  });

  describe('initiateSsoRedirect', () => {
    const setEnv = () => {
      Object.defineProperty(window, '_env_', {
        value: {
          VITE_APP_MATRIX_ENABLED: 'true',
          VITE_APP_MATRIX_HOMESERVER_URL: HOMESERVER,
          VITE_APP_MATRIX_ALLOWED_USERS: '',
        },
        writable: true,
        configurable: true,
      });
    };

    it('builds redirect URL from own origin + fixed callback route', async () => {
      setEnv();
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(makeLoginResponse()), { status: 200 })
      );

      const navigate = vi.fn();

      const { initiateSsoRedirect: fresh } = await import('./ssoLogin');
      const result = await fresh(navigate);

      expect(result.ok).toBe(true);
      expect(navigate).toHaveBeenCalledOnce();

      const url = navigate.mock.calls[0][0] as string;
      expect(url).toContain('/_matrix/client/v3/login/sso/redirect/test-idp');
      expect(url).toContain(`redirectUrl=${encodeURIComponent(`${window.location.origin}${CALLBACK_ROUTE}`)}`);
    });

    it('saves app state before redirect', async () => {
      setEnv();
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(makeLoginResponse()), { status: 200 })
      );

      const navigate = vi.fn();
      const { initiateSsoRedirect: fresh } = await import('./ssoLogin');
      await fresh(navigate);

      const stored = sessionStorage.getItem(PENDING_SSO_KEY) ?? '';
      expect(stored).not.toBe('');
      const state = JSON.parse(stored);
      expect(state.returnPath).toBeDefined();
      expect(state.startedAt).toBeGreaterThan(0);
    });

    it('does not redirect when matrix is disabled', async () => {
      Object.defineProperty(window, '_env_', {
        value: { VITE_APP_MATRIX_ENABLED: 'false', VITE_APP_MATRIX_HOMESERVER_URL: HOMESERVER },
        writable: true,
        configurable: true,
      });

      const navigate = vi.fn();
      const { initiateSsoRedirect: fresh } = await import('./ssoLogin');
      const result = await fresh(navigate);

      expect(result.ok).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('attemptSilentSso', () => {
    const setEnv = () => {
      Object.defineProperty(window, '_env_', {
        value: {
          VITE_APP_MATRIX_ENABLED: 'true',
          VITE_APP_MATRIX_HOMESERVER_URL: HOMESERVER,
          VITE_APP_MATRIX_ALLOWED_USERS: '',
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

      expect(result).toBe(false);
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('resolves true when the callback persists fresh credentials, then removes the iframe', async () => {
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
      expect(result).toBe(true);
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('times out and resolves false when no credentials appear', async () => {
      setEnv();
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(makeLoginResponse()), { status: 200 })
      );

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const result = await fresh(LOCALPART, { timeoutMs: 100, pollIntervalMs: 20 });

      expect(result).toBe(false);
      expect(document.querySelector('iframe')).toBeNull();
    });

    it('points the hidden iframe at the SSO redirect URL for the discovered idp', async () => {
      setEnv();
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(makeLoginResponse()), { status: 200 })
      );

      const { attemptSilentSso: fresh } = await import('./ssoLogin');
      const attempt = fresh(LOCALPART, { timeoutMs: 100, pollIntervalMs: 20 });
      await vi.waitFor(() => {
        expect(document.querySelector('iframe')).not.toBeNull();
      });

      const iframe = document.querySelector('iframe');
      expect(iframe?.src).toContain('/_matrix/client/v3/login/sso/redirect/test-idp');
      expect(iframe?.src).toContain(encodeURIComponent(`${window.location.origin}${CALLBACK_ROUTE}`));
      expect(iframe?.style.display).toBe('none');

      await attempt;
    });
  });

  describe('flow state persistence', () => {
    it('round-trips save → load → clear', () => {
      saveSsoFlowState('/some/page?tab=1');

      const loaded = loadSsoFlowState();
      expect(loaded).not.toBeNull();
      expect(loaded?.returnPath).toBe('/some/page?tab=1');

      clearSsoFlowState();
      expect(loadSsoFlowState()).toBeNull();
    });
  });
});
