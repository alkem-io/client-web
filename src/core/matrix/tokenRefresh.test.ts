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

  it('throws on a non-200 response and leaves stored tokens untouched', async () => {
    await seedRecord();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('', { status: 401 }));

    await expect(refreshMatrixTokens(HOMESERVER, USER_ID, 'syr_old_refresh')).rejects.toThrow('401');

    const stored = await loadCredentials(USER_ID);
    expect(stored.record?.accessToken).toBe('syt_old_access');
  });
});
