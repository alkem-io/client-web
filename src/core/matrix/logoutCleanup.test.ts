import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearNamespace, storeCredentials } from './storage';

const HOMESERVER = 'https://matrix.dev-alkem.io';
const USER_ID = '@logout-user:matrix.dev-alkem.io';

const setEnv = (enabled = true) => {
  Object.defineProperty(window, '_env_', {
    value: {
      VITE_APP_MATRIX_ENABLED: enabled ? 'true' : 'false',
      VITE_APP_MATRIX_HOMESERVER_URL: HOMESERVER,
      VITE_APP_MATRIX_ALLOWED_USERS: '',
    },
    writable: true,
    configurable: true,
  });
};

const seedRecord = () =>
  storeCredentials({
    userId: USER_ID,
    deviceId: 'DEV1',
    accessToken: 'syt_logout_access',
    refreshToken: 'syr_logout_refresh',
    expiresAt: Date.now() + 60_000,
    homeserverUrl: HOMESERVER,
    storedAt: Date.now(),
  });

class MockBroadcastChannel {
  static instances: MockBroadcastChannel[] = [];
  static onPost: ((name: string, message: unknown) => void) | undefined;
  readonly name: string;
  readonly posted: unknown[] = [];
  closed = false;

  constructor(name: string) {
    this.name = name;
    MockBroadcastChannel.instances.push(this);
  }

  postMessage(message: unknown): void {
    this.posted.push(message);
    MockBroadcastChannel.onPost?.(this.name, message);
  }

  close(): void {
    this.closed = true;
  }
}

describe('logoutCleanup', () => {
  beforeEach(() => {
    vi.resetModules();
    MockBroadcastChannel.instances = [];
    MockBroadcastChannel.onPost = undefined;
    (globalThis as Record<string, unknown>).BroadcastChannel = MockBroadcastChannel;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    delete (globalThis as Record<string, unknown>).BroadcastChannel;
    delete (window as unknown as Record<string, unknown>)._env_;
    await clearNamespace(USER_ID);
  });

  it('runs the sign-out ordering: profile sign-out → stop → bounded /logout → clear → broadcast → release', async () => {
    setEnv();
    await seedRecord();
    const order: string[] = [];

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      order.push('logout-post');
      return new Response('{}', { status: 200 });
    });
    vi.spyOn(indexedDB, 'deleteDatabase').mockImplementation((...args) => {
      order.push('clear');
      return new IDBFactory().deleteDatabase(...args);
    });
    MockBroadcastChannel.onPost = name => {
      order.push(name === 'alkemio-matrix-signout' ? 'profile-signout' : 'broadcast');
    };

    const { registerActiveSession } = await import('./activeSession');
    registerActiveSession(() => {
      order.push('stop');
      return () => order.push('release-lock');
    });

    const { runMatrixLogoutCleanup } = await import('./logoutCleanup');
    await runMatrixLogoutCleanup();

    // The sync lock outlives the cleanup: released earlier, it would promote a
    // follower tab onto credentials that are about to be revoked.
    // The profile-wide announcement goes first so a tab still acquiring
    // credentials (no per-user channel yet) stops before anything is listed.
    expect(order).toEqual(['profile-signout', 'stop', 'logout-post', 'clear', 'broadcast', 'release-lock']);

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${HOMESERVER}/_matrix/client/v3/logout`);
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('omit');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer syt_logout_access');

    const channel = MockBroadcastChannel.instances.find(c => c.name === `alkemio-matrix-${USER_ID}`);
    expect(channel?.posted).toEqual([{ type: 'logout' }]);
  });

  it('an unreachable Synapse never blocks sign-out: times out, still clears locally', async () => {
    setEnv();
    await seedRecord();

    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        })
    );

    const { runMatrixLogoutCleanup } = await import('./logoutCleanup');
    const { loadCredentials } = await import('./storage');
    await runMatrixLogoutCleanup({ timeoutMs: 50 });

    expect((await loadCredentials(USER_ID)).record).toBe(null);
    const channel = MockBroadcastChannel.instances.find(c => c.name === `alkemio-matrix-${USER_ID}`);
    expect(channel?.posted).toEqual([{ type: 'logout' }]);
  });

  it('resets the messaging-opened latch so the next sign-in stays dormant until messaging opens again', async () => {
    setEnv();
    const { notifyMessagingOpened, onMessagingOpened } = await import('./activeSession');
    notifyMessagingOpened();

    const { runMatrixLogoutCleanup } = await import('./logoutCleanup');
    await runMatrixLogoutCleanup();

    const listener = vi.fn();
    onMessagingOpened(listener);
    expect(listener).not.toHaveBeenCalled();

    notifyMessagingOpened();
    expect(listener).toHaveBeenCalledOnce();
  });

  it('with the flag off and nothing stored: no network, no storage writes', async () => {
    setEnv(false);

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const openSpy = vi.spyOn(indexedDB, 'open');
    const deleteSpy = vi.spyOn(indexedDB, 'deleteDatabase');

    const { runMatrixLogoutCleanup } = await import('./logoutCleanup');
    await runMatrixLogoutCleanup();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('with the flag off, still removes credentials stored while it was on (rollback)', async () => {
    setEnv(false);
    await seedRecord();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));

    const { runMatrixLogoutCleanup } = await import('./logoutCleanup');
    const { loadCredentials } = await import('./storage');
    await runMatrixLogoutCleanup();

    expect((await loadCredentials(USER_ID)).record).toBe(null);
    expect(globalThis.fetch).toHaveBeenCalledWith(`${HOMESERVER}/_matrix/client/v3/logout`, expect.anything());
  });

  it('never rejects, even when storage enumeration throws', async () => {
    setEnv();
    vi.spyOn(indexedDB, 'databases').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    const { runMatrixLogoutCleanup } = await import('./logoutCleanup');
    await expect(runMatrixLogoutCleanup()).resolves.toBeUndefined();
  });

  it('cleanupMatrixUser clears and broadcasts even when no credential record exists', async () => {
    setEnv();

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { cleanupMatrixUser } = await import('./logoutCleanup');
    await cleanupMatrixUser(USER_ID);

    expect(fetchSpy).not.toHaveBeenCalled();
    const channel = MockBroadcastChannel.instances.find(c => c.name === `alkemio-matrix-${USER_ID}`);
    expect(channel?.posted).toEqual([{ type: 'logout' }]);
  });
});
