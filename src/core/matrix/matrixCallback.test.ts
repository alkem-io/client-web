import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleMatrixCallback } from './matrixCallback';
import { clearNamespace, loadCredentials } from './storage';

const HOMESERVER = 'https://matrix.dev-alkem.io';

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
    window.history.replaceState(null, '', '/');
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    window.history.replaceState(null, '', '/');
    await clearNamespace(EXCHANGE_RESPONSE.user_id);
  });

  describe('handleMatrixCallback', () => {
    it('does nothing when no loginToken in URL', async () => {
      window.history.replaceState(null, '', '/matrix-callback');
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      await handleMatrixCallback(HOMESERVER);

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(await loadCredentials(EXCHANGE_RESPONSE.user_id)).toBe(null);
    });

    it('reads the loginToken from the URL, exchanges it without requesting a refresh token, and persists credentials', async () => {
      setUrlWithToken('mlt_valid');

      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(EXCHANGE_RESPONSE), { status: 200 }));

      await handleMatrixCallback(HOMESERVER);

      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe(`${HOMESERVER}/_matrix/client/v3/login`);
      expect(init?.method).toBe('POST');
      expect(init?.credentials).toBe('omit');

      const body = JSON.parse(init?.body as string);
      expect(body.type).toBe('m.login.token');
      expect(body.token).toBe('mlt_valid');
      expect(body.refresh_token).toBeUndefined();
      expect(body.initial_device_display_name).toBe('Alkemio Web');

      const stored = await loadCredentials(EXCHANGE_RESPONSE.user_id);
      expect(stored).not.toBeNull();
      expect(stored?.accessToken).toBe(EXCHANGE_RESPONSE.access_token);
      expect(stored?.deviceId).toBe(EXCHANGE_RESPONSE.device_id);
    });
  });
});
