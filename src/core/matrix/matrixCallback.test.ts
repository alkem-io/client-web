import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleMatrixCallback } from './matrixCallback';
import { loadCredentials } from './storage';

const HOMESERVER = 'https://matrix.dev-alkem.io';

const setEnv = () => {
  Object.defineProperty(window, '_env_', {
    value: { VITE_APP_MATRIX_HOMESERVER_URL: HOMESERVER },
    writable: true,
    configurable: true,
  });
};

const setUrlWithToken = (token: string) => {
  window.history.replaceState(null, '', `/matrix-callback?loginToken=${token}`);
};

const EXCHANGE_RESPONSE = {
  user_id: '@alice-uuid:matrix.dev-alkem.io',
  device_id: 'DEVICE_XYZ',
  access_token: 'syt_new_access_token',
};

describe('matrixCallback', () => {
  beforeEach(() => {
    vi.resetModules();
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as unknown as Record<string, unknown>)._env_;
    window.history.replaceState(null, '', '/');
  });

  describe('handleMatrixCallback', () => {
    it('rejects when no loginToken in URL', async () => {
      window.history.replaceState(null, '', '/matrix-callback');

      const result = await handleMatrixCallback();
      expect(result.ok).toBe(false);
      expect(result.error).toContain('no loginToken');
    });

    it('reads the loginToken without requiring a pending-flow marker', async () => {
      setEnv();
      setUrlWithToken('mlt_no_marker');

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(EXCHANGE_RESPONSE), { status: 200 })
      );

      const { handleMatrixCallback: fresh } = await import('./matrixCallback');
      const result = await fresh();

      expect(result.ok).toBe(true);
    });

    it('exchanges the loginToken without requesting a refresh token, and persists credentials', async () => {
      setEnv();
      setUrlWithToken('mlt_valid');

      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(EXCHANGE_RESPONSE), { status: 200 }));

      const { handleMatrixCallback: fresh } = await import('./matrixCallback');
      const result = await fresh();

      expect(result.ok).toBe(true);

      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe(`${HOMESERVER}/_matrix/client/v3/login`);
      expect(init?.method).toBe('POST');
      expect(init?.credentials).toBe('omit');

      const body = JSON.parse(init?.body as string);
      expect(body.type).toBe('m.login.token');
      expect(body.token).toBe('mlt_valid');
      expect(body.refresh_token).toBeUndefined();
      expect(body.initial_device_display_name).toBe('Alkemio Web');
    });

    it('persists credentials to IndexedDB', async () => {
      setEnv();
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
      expect(stored.record?.deviceId).toBe(EXCHANGE_RESPONSE.device_id);
    });

    it('does not send credentials to homeserver', async () => {
      setEnv();
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
