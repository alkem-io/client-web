import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerActiveSession, stopActiveSession } from './activeSession';
import { runMatrixLogoutCleanup } from './logoutCleanup';
import { clearNamespace, loadCredentials, storeCredentials } from './storage';

vi.mock('./storage', async importOriginal => {
  const actual = await importOriginal<typeof import('./storage')>();
  return { ...actual, clearNamespace: vi.fn(actual.clearNamespace) };
});

const HOMESERVER = 'https://matrix.dev-alkem.io';
const USER_ID = '@logout-user:matrix.dev-alkem.io';
const OTHER_USER_ID = '@logout-other:matrix.dev-alkem.io';

const seedRecord = (userId = USER_ID) =>
  storeCredentials({
    userId,
    deviceId: 'DEV1',
    accessToken: 'syt_logout_access',
    homeserverUrl: HOMESERVER,
  });

describe('logoutCleanup', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    stopActiveSession();
    await clearNamespace(USER_ID);
    await clearNamespace(OTHER_USER_ID);
  });

  it("clears the current session's stored credentials on sign-out", async () => {
    await seedRecord();
    registerActiveSession(() => {});

    await runMatrixLogoutCleanup();

    expect(await loadCredentials(USER_ID)).toBe(null);
  });

  it('stops the registered session before touching storage', async () => {
    await seedRecord();
    const order: string[] = [];
    registerActiveSession(() => order.push('stop'));
    const original = indexedDB.databases.bind(indexedDB);
    const databasesSpy = vi.spyOn(indexedDB, 'databases').mockImplementation(() => {
      order.push('storage');
      return original();
    });

    await runMatrixLogoutCleanup();

    expect(order).toEqual(['stop', 'storage']);
    expect(databasesSpy).toHaveBeenCalled();
  });

  it('clears stored credentials even when no session is registered in this tab', async () => {
    await seedRecord();

    await runMatrixLogoutCleanup();

    expect(await loadCredentials(USER_ID)).toBe(null);
  });

  it('never rejects, even when storage enumeration throws', async () => {
    registerActiveSession(() => {});
    vi.spyOn(indexedDB, 'databases').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    await expect(runMatrixLogoutCleanup()).resolves.toBeUndefined();
  });

  it('logs the device out on the homeserver after clearing the local record', async () => {
    await seedRecord();
    vi.mocked(clearNamespace).mockClear();
    let releaseClear: () => void = () => {};
    vi.mocked(clearNamespace).mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          releaseClear = resolve;
        })
    );
    const fetchSpy = vi.mocked(globalThis.fetch);

    const pending = runMatrixLogoutCleanup();
    await vi.waitFor(() => expect(clearNamespace).toHaveBeenCalledWith(USER_ID));
    expect(fetchSpy).not.toHaveBeenCalled();

    releaseClear();
    await pending;

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${HOMESERVER}/_matrix/client/v3/logout`);
    expect(init).toMatchObject({
      method: 'POST',
      credentials: 'omit',
      headers: { Authorization: 'Bearer syt_logout_access' },
    });
  });

  it('caps the whole sign-out at 3 s across several stored namespaces', async () => {
    await seedRecord(USER_ID);
    await seedRecord(OTHER_USER_ID);
    let bothSent: () => void = () => {};
    const sent = new Promise<void>(resolve => {
      bothSent = resolve;
    });
    const fetchSpy = vi.mocked(globalThis.fetch).mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
          if (fetchSpy.mock.calls.length === 2) bothSent();
        })
    );
    // Only the timers: IndexedDB keeps its own scheduling, and vi.waitFor would advance a faked clock.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    let done = false;
    const pending = runMatrixLogoutCleanup().then(() => {
      done = true;
    });
    await sent;

    await vi.advanceTimersByTimeAsync(2999);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await pending;

    expect(done).toBe(true);
    expect(await loadCredentials(USER_ID)).toBe(null);
    expect(await loadCredentials(OTHER_USER_ID)).toBe(null);
  });

  it.each([
    ['the homeserver is unreachable', () => Promise.reject(new TypeError('Failed to fetch'))],
    ['the homeserver answers 500', () => Promise.resolve(new Response(null, { status: 500 }))],
  ])('completes sign-out when the homeserver logout fails (%s)', async (_case, respond) => {
    await seedRecord();
    vi.mocked(globalThis.fetch).mockImplementation(respond);

    await expect(runMatrixLogoutCleanup()).resolves.toBeUndefined();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(await loadCredentials(USER_ID)).toBe(null);
  });

  it('sends no homeserver request when nothing is stored', async () => {
    await runMatrixLogoutCleanup();

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
