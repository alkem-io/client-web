import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exchangeAndStore, handleMatrixCallback, isAcceptedParent } from './matrixCallback';
import * as storage from './storage';
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

    it('stores nothing when the exchange response lacks the access token', async () => {
      setUrlWithToken('mlt_valid');
      const { access_token: _omitted, ...incomplete } = EXCHANGE_RESPONSE;
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(incomplete), { status: 200 }));

      await handleMatrixCallback(HOMESERVER);

      expect(await loadCredentials(EXCHANGE_RESPONSE.user_id)).toBe(null);
    });
  });

  describe('isAcceptedParent', () => {
    it('accepts only an exact https origin on a subdomain of the own host', async () => {
      expect(isAcceptedParent('https://hub.alkem.io', 'alkem.io')).toBe(true);
      expect(isAcceptedParent('https://a.b.alkem.io', 'alkem.io')).toBe(true);

      expect(isAcceptedParent('https://alkem.io', 'alkem.io')).toBe(false);
      expect(isAcceptedParent('http://hub.alkem.io', 'alkem.io')).toBe(false);
      expect(isAcceptedParent('https://evilalkem.io', 'alkem.io')).toBe(false);
      expect(isAcceptedParent('https://alkem.io.evil.com', 'alkem.io')).toBe(false);
      expect(isAcceptedParent('https://hub.alkem.io/path', 'alkem.io')).toBe(false);
      expect(isAcceptedParent('https://user@hub.alkem.io', 'alkem.io')).toBe(false);
      expect(isAcceptedParent('not a url', 'alkem.io')).toBe(false);
    });
  });

  describe('handleMatrixCallback with a parent', () => {
    it('posts the token to an accepted parent with that exact target origin, without exchanging or storing', async () => {
      const parent = `https://hub.${window.location.host}`;
      window.history.replaceState(null, '', `/matrix-callback?loginToken=mlt_hub&parent=${encodeURIComponent(parent)}`);
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});

      await handleMatrixCallback(HOMESERVER);

      expect(postMessage).toHaveBeenCalledWith({ loginToken: 'mlt_hub' }, parent);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('refuses a parent that is not a subdomain of its own host: nothing posted, nothing exchanged', async () => {
      window.history.replaceState(
        null,
        '',
        `/matrix-callback?loginToken=mlt_evil&parent=${encodeURIComponent('https://evil.example.com')}`
      );
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});

      await handleMatrixCallback(HOMESERVER);

      expect(postMessage).not.toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('exchangeAndStore', () => {
    it('persists nothing when the session is aborted while the exchange is in flight', async () => {
      const session = new AbortController();
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
        session.abort();
        return new Response(JSON.stringify(EXCHANGE_RESPONSE), { status: 200 });
      });

      await exchangeAndStore(HOMESERVER, 'mlt_late', session.signal);

      expect(await loadCredentials(EXCHANGE_RESPONSE.user_id)).toBe(null);
    });

    it('removes the record when the session is aborted during the write', async () => {
      const session = new AbortController();
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(EXCHANGE_RESPONSE), { status: 200 }));
      const write = storage.storeCredentials;
      vi.spyOn(storage, 'storeCredentials').mockImplementation(async record => {
        const stored = await write(record);
        session.abort();
        return stored;
      });

      await exchangeAndStore(HOMESERVER, 'mlt_during_write', session.signal);

      expect(await loadCredentials(EXCHANGE_RESPONSE.user_id)).toBe(null);
    });
  });
});
