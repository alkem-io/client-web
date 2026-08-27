import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearNamespace, loadCredentials, storeCredentials } from './storage';
import { refreshMatrixTokens } from './tokenRefresh';

const HOMESERVER = 'https://matrix.dev-alkem.io';
const USER_ID = '@refresh-user:matrix.dev-alkem.io';

const seedRecord = () =>
  storeCredentials({
    userId: USER_ID,
    deviceId: 'DEV1',
    accessToken: 'syt_old_access',
    refreshToken: 'syr_old_refresh',
    expiresAt: Date.now() - 1000,
    homeserverUrl: HOMESERVER,
    storedAt: Date.now(),
  });

describe('refreshMatrixTokens', () => {
  afterEach(async () => {
    vi.restoreAllMocks();
    await clearNamespace(USER_ID);
  });

  it('posts the refresh token without credentials and persists the rotated pair', async () => {
    await seedRecord();
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ access_token: 'syt_new_access', refresh_token: 'syr_new_refresh', expires_in_ms: 60_000 }),
          { status: 200 }
        )
      );

    const result = await refreshMatrixTokens(HOMESERVER, USER_ID, 'syr_old_refresh');

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${HOMESERVER}/_matrix/client/v3/refresh`);
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('omit');
    expect(JSON.parse(init?.body as string)).toEqual({ refresh_token: 'syr_old_refresh' });

    expect(result.accessToken).toBe('syt_new_access');
    expect(result.refreshToken).toBe('syr_new_refresh');

    const stored = await loadCredentials(USER_ID);
    expect(stored.record?.accessToken).toBe('syt_new_access');
    expect(stored.record?.refreshToken).toBe('syr_new_refresh');
    expect(stored.record?.expiresAt).toBeGreaterThan(Date.now());
  });

  it('keeps the old refresh token when the response omits one', async () => {
    await seedRecord();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: 'syt_new_access', expires_in_ms: 60_000 }), { status: 200 })
    );

    const result = await refreshMatrixTokens(HOMESERVER, USER_ID, 'syr_old_refresh');
    expect(result.refreshToken).toBe('syr_old_refresh');

    const stored = await loadCredentials(USER_ID);
    expect(stored.record?.refreshToken).toBe('syr_old_refresh');
  });

  it('stores a non-expiring expiry when the response omits expires_in_ms', async () => {
    await seedRecord();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: 'syt_new_access' }), { status: 200 })
    );

    const result = await refreshMatrixTokens(HOMESERVER, USER_ID, 'syr_old_refresh');
    expect(result.expiry.getTime()).toBeGreaterThan(Date.now() + 1_000_000_000);

    const stored = await loadCredentials(USER_ID);
    expect(stored.record?.expiresAt).toBeGreaterThan(Date.now() + 1_000_000_000);
  });

  it('throws on a non-200 response and leaves stored tokens untouched', async () => {
    await seedRecord();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('', { status: 401 }));

    await expect(refreshMatrixTokens(HOMESERVER, USER_ID, 'syr_old_refresh')).rejects.toThrow('401');

    const stored = await loadCredentials(USER_ID);
    expect(stored.record?.accessToken).toBe('syt_old_access');
  });

  describe('soft_logout retry (contract §3)', () => {
    const softLogoutResponse = () =>
      new Response(JSON.stringify({ errcode: 'M_UNKNOWN_TOKEN', soft_logout: true }), { status: 401 });

    it('retries exactly once on M_UNKNOWN_TOKEN with soft_logout, then persists the rotated pair', async () => {
      await seedRecord();
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(softLogoutResponse())
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ access_token: 'syt_new_access', refresh_token: 'syr_new_refresh', expires_in_ms: 60_000 }),
            { status: 200 }
          )
        );

      const result = await refreshMatrixTokens(HOMESERVER, USER_ID, 'syr_old_refresh');

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      // The old refresh token stays valid until the new access token is first
      // used, so the retry re-sends the same token.
      expect(JSON.parse(fetchSpy.mock.calls[1][1]?.body as string)).toEqual({ refresh_token: 'syr_old_refresh' });
      expect(result.accessToken).toBe('syt_new_access');

      const stored = await loadCredentials(USER_ID);
      expect(stored.record?.accessToken).toBe('syt_new_access');
    });

    it('does not retry a hard M_UNKNOWN_TOKEN (soft_logout absent) — escalates immediately', async () => {
      await seedRecord();
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify({ errcode: 'M_UNKNOWN_TOKEN' }), { status: 401 }));

      await expect(refreshMatrixTokens(HOMESERVER, USER_ID, 'syr_old_refresh')).rejects.toMatchObject({
        errcode: 'M_UNKNOWN_TOKEN',
        softLogout: false,
      });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('escalates after the single retry also fails — never loops', async () => {
      await seedRecord();
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(softLogoutResponse())
        .mockResolvedValueOnce(softLogoutResponse());

      await expect(refreshMatrixTokens(HOMESERVER, USER_ID, 'syr_old_refresh')).rejects.toMatchObject({
        errcode: 'M_UNKNOWN_TOKEN',
        softLogout: true,
      });
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      const stored = await loadCredentials(USER_ID);
      expect(stored.record?.accessToken).toBe('syt_old_access');
    });
  });
});
