import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleMatrixCallback, scrubLoginToken } from './matrixCallback';
import { PENDING_SSO_KEY } from './ssoLogin';
import { loadCredentials } from './storage';

const HOMESERVER = 'https://matrix.dev-alkem.io';

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

const setPendingFlow = (returnPath = '/space/test') => {
  sessionStorage.setItem(PENDING_SSO_KEY, JSON.stringify({ returnPath, startedAt: Date.now() }));
};

const setUrlWithToken = (token: string) => {
  window.history.replaceState(null, '', `/matrix-callback?loginToken=${token}`);
};

const EXCHANGE_RESPONSE = {
  user_id: '@alice-uuid:matrix.dev-alkem.io',
  device_id: 'DEVICE_XYZ',
  access_token: 'syt_new_access_token',
  refresh_token: 'syr_new_refresh_token',
  expires_in_ms: 900_000,
};

describe('matrixCallback', () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as unknown as Record<string, unknown>)._env_;
    sessionStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  describe('scrubLoginToken', () => {
    it('removes loginToken from URL synchronously and returns the value', () => {
      setUrlWithToken('mlt_test123');

      const token = scrubLoginToken();

      expect(token).toBe('mlt_test123');
      expect(window.location.search).not.toContain('loginToken');
      expect(window.location.pathname).toBe('/matrix-callback');
    });

    it('preserves other query parameters', () => {
      window.history.replaceState(null, '', '/matrix-callback?other=value&loginToken=mlt_abc&keep=yes');

      const token = scrubLoginToken();

      expect(token).toBe('mlt_abc');
      expect(window.location.search).toContain('other=value');
      expect(window.location.search).toContain('keep=yes');
      expect(window.location.search).not.toContain('loginToken');
    });

    it('returns null when no loginToken present', () => {
      window.history.replaceState(null, '', '/matrix-callback');
      expect(scrubLoginToken()).toBeNull();
    });
  });

  describe('handleMatrixCallback', () => {
    it('rejects when no loginToken in URL', async () => {
      window.history.replaceState(null, '', '/matrix-callback');

      const result = await handleMatrixCallback();
      expect(result.ok).toBe(false);
      expect(result.error).toContain('no loginToken');
    });

    it('rejects unsolicited token (no pending flow)', async () => {
      setUrlWithToken('mlt_unsolicited');

      const sink = vi.fn();
      const result = await handleMatrixCallback(sink);

      expect(result.ok).toBe(false);
      expect(result.error).toContain('unsolicited');
      expect(sink).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('unsolicited') }));
    });

    it('exchanges loginToken with refresh_token: true and persists credentials', async () => {
      setEnv();
      setPendingFlow('/space/test');
      setUrlWithToken('mlt_valid');

      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(EXCHANGE_RESPONSE), { status: 200 }));

      const navigate = vi.fn();
      const { handleMatrixCallback: fresh } = await import('./matrixCallback');
      const result = await fresh(undefined, navigate);

      expect(result.ok).toBe(true);
      expect(result.returnPath).toBe('/space/test');

      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe(`${HOMESERVER}/_matrix/client/v3/login`);
      expect(init?.method).toBe('POST');
      expect(init?.credentials).toBe('omit');

      const body = JSON.parse(init?.body as string);
      expect(body.type).toBe('m.login.token');
      expect(body.token).toBe('mlt_valid');
      expect(body.refresh_token).toBe(true);
      expect(body.initial_device_display_name).toBe('Alkemio Web');
    });

    it('persists credentials to IndexedDB', async () => {
      setEnv();
      setPendingFlow();
      setUrlWithToken('mlt_persist');

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(EXCHANGE_RESPONSE), { status: 200 })
      );

      const { handleMatrixCallback: fresh } = await import('./matrixCallback');
      await fresh();

      const stored = await loadCredentials(EXCHANGE_RESPONSE.user_id);
      expect(stored.available).toBe(true);
      expect(stored.record).not.toBeNull();
      expect(stored.record?.accessToken).toBe(EXCHANGE_RESPONSE.access_token);
      expect(stored.record?.refreshToken).toBe(EXCHANGE_RESPONSE.refresh_token);
      expect(stored.record?.deviceId).toBe(EXCHANGE_RESPONSE.device_id);
    });

    it('navigates to saved return path', async () => {
      setEnv();
      setPendingFlow('/my/return/path');
      setUrlWithToken('mlt_nav');

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(EXCHANGE_RESPONSE), { status: 200 })
      );

      const navigate = vi.fn();
      const { handleMatrixCallback: fresh } = await import('./matrixCallback');
      await fresh(undefined, navigate);

      expect(navigate).toHaveBeenCalledWith('/my/return/path');
    });

    it('clears the pending flow marker after use', async () => {
      setEnv();
      setPendingFlow();
      setUrlWithToken('mlt_clear');

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(EXCHANGE_RESPONSE), { status: 200 })
      );

      const { handleMatrixCallback: fresh } = await import('./matrixCallback');
      await fresh();

      expect(sessionStorage.getItem(PENDING_SSO_KEY)).toBeNull();
    });

    it('does not send credentials to homeserver (D-06)', async () => {
      setEnv();
      setPendingFlow();
      setUrlWithToken('mlt_d06');

      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(EXCHANGE_RESPONSE), { status: 200 }));

      const { handleMatrixCallback: fresh } = await import('./matrixCallback');
      await fresh();

      const [, init] = fetchSpy.mock.calls[0];
      expect(init?.credentials).toBe('omit');
    });
  });
});
