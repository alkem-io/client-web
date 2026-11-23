import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { announceDeviceChanged, announceSignedOut } from './sharedDevice';
import { clearNamespace, loadCredentials, storeCredentials } from './storage';

// Two tabs of one browser: each runs its own copy of the session controller
// (its own module graph), and they share what a browser shares between tabs —
// IndexedDB, the Web Locks manager and BroadcastChannel. The chat server is
// scripted; the SDK client is a double that records how it was built.

const ACTOR = 'tabs-actor';
const USER_ID = `@${ACTOR}:matrix.test-alkem.io`;
const HOMESERVER = 'https://matrix.test-alkem.io';
const LIFETIME_MS = 15 * 60 * 1000;

type FakeClient = {
  opts: { deviceId: string; accessToken: string; fetchFn: typeof fetch };
  stopClient: ReturnType<typeof vi.fn>;
  startClient: ReturnType<typeof vi.fn>;
  setAccessToken: ReturnType<typeof vi.fn>;
  on: (event: string, listener: (state?: string) => void) => void;
  emit: (event: string, state?: string) => void;
};

const sdk = vi.hoisted(() => ({
  createClient: vi.fn((opts: FakeClient['opts']): FakeClient => {
    const handlers = new Map<string, (state?: string) => void>();
    return {
      opts,
      stopClient: vi.fn(),
      startClient: vi.fn(async () => undefined),
      setAccessToken: vi.fn(),
      on: (event, listener) => {
        handlers.set(event, listener);
      },
      emit: (event, state) => handlers.get(event)?.(state),
    };
  }),
}));

vi.mock('matrix-js-sdk', () => ({ createClient: sdk.createClient }));
vi.mock('./mintSession', () => ({ mintAndStore: vi.fn(async () => null) }));
// Silent SSO without the iframe: the real token exchange and store, as the callback page runs them.
vi.mock('./ssoLogin', () => ({
  attemptSilentSso: vi.fn(async (localpart: string, options?: { replacing?: string }) => {
    const { exchangeAndStore } = await vi.importActual<typeof import('./matrixCallback')>('./matrixCallback');
    const { loadActorCredentials } = await vi.importActual<typeof import('./storage')>('./storage');
    await exchangeAndStore('https://matrix.test-alkem.io', 'mlt_token');
    const record = await loadActorCredentials(localpart);
    return record && record.deviceId !== options?.replacing ? 'authenticated' : 'timeout';
  }),
}));

/** One lock manager for every tab: callbacks per name run one after another. */
const stubLocks = () => {
  const tails = new Map<string, Promise<unknown>>();
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: {
      request: (name: string, optionsOrTask: unknown, maybeTask?: () => Promise<unknown>) => {
        const task = (typeof optionsOrTask === 'function' ? optionsOrTask : maybeTask) as () => Promise<unknown>;
        const run = (tails.get(name) ?? Promise.resolve()).then(task);
        tails.set(
          name,
          run.catch(() => undefined)
        );
        return run;
      },
    },
  });
};

/** One BroadcastChannel bus for every tab: a message reaches every other open channel of the name. */
const stubBroadcastChannel = () => {
  const open = new Map<string, Set<FakeChannel>>();
  class FakeChannel extends EventTarget {
    private closed = false;
    constructor(readonly name: string) {
      super();
      open.set(name, (open.get(name) ?? new Set()).add(this));
    }
    postMessage(data: unknown) {
      const copy = JSON.parse(JSON.stringify(data));
      for (const other of open.get(this.name) ?? []) {
        if (other !== this) {
          queueMicrotask(() => {
            if (!other.closed) {
              other.dispatchEvent(new MessageEvent('message', { data: copy }));
            }
          });
        }
      }
    }
    close() {
      this.closed = true;
      open.get(this.name)?.delete(this);
    }
  }
  vi.stubGlobal('BroadcastChannel', FakeChannel);
};

type Sent = { path: string; token: string | undefined; body: unknown };

const scriptChatServer = (refreshStatus = 200) => {
  const sent: Sent[] = [];
  let devices = 0;
  let refreshes = 0;
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
  const fetchStub = vi.fn(async (resource: URL | string, init?: RequestInit) => {
    const path = new URL(resource.toString()).pathname;
    const token = new Headers(init?.headers).get('Authorization')?.replace(/^Bearer /, '');
    sent.push({ path, token, body: init?.body ? JSON.parse(init.body as string) : undefined });
    if (path.endsWith('/login')) {
      devices++;
      return json(200, {
        user_id: USER_ID,
        device_id: `DEV_NEW_${devices}`,
        access_token: `syt_new_${devices}`,
        refresh_token: `syr_new_${devices}`,
        expires_in_ms: LIFETIME_MS,
      });
    }
    if (path.endsWith('/refresh')) {
      if (refreshStatus !== 200) {
        return json(refreshStatus, { errcode: 'M_UNKNOWN_TOKEN' });
      }
      refreshes++;
      return json(200, {
        access_token: `syt_renewed_${refreshes}`,
        refresh_token: `syr_renewed_${refreshes}`,
        expires_in_ms: LIFETIME_MS,
      });
    }
    return json(200, {});
  });
  const to = (suffix: string) => sent.filter(r => r.path.endsWith(suffix));
  return { fetchStub, to };
};

/** A fresh copy of the controller and its registries, as a separate tab would load them. */
const openTab = async () => {
  vi.resetModules();
  const controller = await import('./sessionController');
  const active = await import('./activeClient');
  const registry = await import('./activeSession');
  const cleanup = await import('./logoutCleanup');
  return {
    boot: () => controller.establishSession(ACTOR),
    client: () => active.getActiveClient() as unknown as FakeClient | null,
    close: () => registry.stopActiveSession(),
    rotate: () => registry.rotateActiveSessionIfDue(),
    signOut: () => cleanup.runMatrixLogoutCleanup(),
  };
};

const seed = (expiresAt = Date.now() + LIFETIME_MS) =>
  storeCredentials({
    userId: USER_ID,
    deviceId: 'DEV1',
    accessToken: 'syt_dev1',
    homeserverUrl: HOMESERVER,
    refreshToken: 'syr_dev1',
    expiresAt,
  });

const recordOf = (deviceId: string) => ({
  userId: USER_ID,
  deviceId,
  accessToken: `syt_${deviceId}`,
  homeserverUrl: HOMESERVER,
});

describe('tabs of one browser share one chat device', () => {
  let tabs: Awaited<ReturnType<typeof openTab>>[] = [];
  const tab = async () => {
    const opened = await openTab();
    tabs.push(opened);
    return opened;
  };

  beforeEach(() => {
    sdk.createClient.mockClear();
    stubLocks();
    stubBroadcastChannel();
  });

  afterEach(async () => {
    for (const opened of tabs) {
      opened.close();
    }
    tabs = [];
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, 'locks');
    await clearNamespace(USER_ID);
  });

  it('two tabs starting together with nothing stored sign in once and run on the same device', async () => {
    const server = scriptChatServer();
    vi.stubGlobal('fetch', server.fetchStub);
    const a = await tab();
    const b = await tab();

    await Promise.all([a.boot(), b.boot()]);

    expect(server.to('/login')).toHaveLength(1);
    expect(a.client()?.opts.deviceId).toBe('DEV_NEW_1');
    expect(b.client()?.opts.deviceId).toBe('DEV_NEW_1');
  });

  it('a tab with nothing stored adopts the device a running tab holds, leaving that tab untouched', async () => {
    const server = scriptChatServer();
    vi.stubGlobal('fetch', server.fetchStub);
    await seed();
    const a = await tab();
    await a.boot();
    const running = a.client();
    // The stored credential is gone, yet tab A (say, in a call) is still on DEV1.
    await clearNamespace(USER_ID);

    const b = await tab();
    await b.boot();

    expect(server.to('/login')).toHaveLength(0);
    expect(b.client()?.opts).toMatchObject({ deviceId: 'DEV1', accessToken: 'syt_dev1' });
    expect(a.client()).toBe(running);
    expect(running?.stopClient).not.toHaveBeenCalled();
    expect(await loadCredentials(USER_ID)).toMatchObject({ deviceId: 'DEV1', refreshToken: 'syr_dev1' });
  });

  it('a sign-out in one tab stops the other at once and logs the shared device out once', async () => {
    const server = scriptChatServer();
    vi.stubGlobal('fetch', server.fetchStub);
    await seed();
    const a = await tab();
    const b = await tab();
    await a.boot();
    await b.boot();
    const running = a.client();

    await b.signOut();
    await vi.waitFor(() => expect(a.client()).toBeNull());

    expect(running?.stopClient).toHaveBeenCalled();
    expect(await loadCredentials(USER_ID)).toBeNull();
    expect(server.to('/logout').map(r => r.token)).toEqual(['syt_dev1']);
    expect(server.to('/refresh')).toHaveLength(0);
  });

  it('a tab that recovers from a rejected shared device creates one new device, and the other tab moves to it at once', async () => {
    const server = scriptChatServer();
    vi.stubGlobal('fetch', server.fetchStub);
    await seed();
    const a = await tab();
    const b = await tab();
    await a.boot();
    await b.boot();
    const bBefore = b.client();

    a.client()?.emit('Session.logged_out');
    await vi.waitFor(() => expect(b.client()?.opts.deviceId).toBe('DEV_NEW_1'));

    expect(a.client()?.opts.deviceId).toBe('DEV_NEW_1');
    expect(server.to('/login')).toHaveLength(1);
    expect(server.to('/logout').map(r => r.token)).toEqual(['syt_dev1']);
    expect(bBefore?.stopClient).toHaveBeenCalled();
    expect(await loadCredentials(USER_ID)).toMatchObject({ deviceId: 'DEV_NEW_1' });
  });

  it('a tab stopped by a sign-out elsewhere resumes on the device the next sign-in stores', async () => {
    const server = scriptChatServer();
    vi.stubGlobal('fetch', server.fetchStub);
    await seed();
    const a = await tab();
    const b = await tab();
    await a.boot();
    await b.boot();

    await b.signOut();
    await vi.waitFor(() => expect(a.client()).toBeNull());
    await b.boot();
    await vi.waitFor(() => expect(a.client()?.opts.deviceId).toBe('DEV_NEW_1'));

    expect(b.client()?.opts.deviceId).toBe('DEV_NEW_1');
    expect(server.to('/login')).toHaveLength(1);
  });

  it('a rotation logs the replaced device out once and every tab moves to the new one', async () => {
    const server = scriptChatServer();
    vi.stubGlobal('fetch', server.fetchStub);
    // Non-renewable and of unknown age: due for rotation.
    await storeCredentials({ userId: USER_ID, deviceId: 'DEV1', accessToken: 'syt_dev1', homeserverUrl: HOMESERVER });
    const a = await tab();
    const b = await tab();
    await a.boot();
    await b.boot();

    expect(await a.rotate()).toBe(true);
    await vi.waitFor(() => expect(b.client()?.opts.deviceId).toBe('DEV_NEW_1'));

    expect(a.client()?.opts.deviceId).toBe('DEV_NEW_1');
    expect(server.to('/login')).toHaveLength(1);
    expect(server.to('/logout').map(r => r.token)).toEqual(['syt_dev1']);
  });

  it('a tab told of two device changes in a row ends on the latest', async () => {
    const server = scriptChatServer();
    vi.stubGlobal('fetch', server.fetchStub);
    await seed();
    const a = await tab();
    await a.boot();

    // Another tab replaced the device twice; the second announcement lands while the first move is under way.
    await storeCredentials(recordOf('DEV3'));
    announceDeviceChanged(recordOf('DEV2'));
    announceDeviceChanged(recordOf('DEV3'));
    await vi.waitFor(() => expect(a.client()?.opts.deviceId).toBe('DEV3'));
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(a.client()?.opts.deviceId).toBe('DEV3');
  });

  it('a sign-out that lands while a tab is reading the changed device keeps that tab stopped', async () => {
    const server = scriptChatServer();
    vi.stubGlobal('fetch', server.fetchStub);
    await seed();
    const a = await tab();
    await a.boot();
    await storeCredentials(recordOf('DEV2'));
    // Another tab holds the credential lock, so A's read of the changed device waits on it.
    let release: () => void = () => undefined;
    void navigator.locks.request(
      `alkemio-matrix/${ACTOR}`,
      () =>
        new Promise<void>(resolve => {
          release = resolve;
        })
    );

    announceDeviceChanged(recordOf('DEV2'));
    await new Promise(resolve => setTimeout(resolve, 10));
    announceSignedOut(['DEV2']);
    await vi.waitFor(() => expect(a.client()).toBeNull());
    release();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(a.client()).toBeNull();
    expect(sdk.createClient.mock.calls.map(([opts]) => opts.deviceId)).toEqual(['DEV1']);
  });

  it('two tabs renewing the shared device make one refresh, and the second adopts the new pair', async () => {
    const server = scriptChatServer();
    vi.stubGlobal('fetch', server.fetchStub);
    // Due for renewal, still valid.
    await seed(Date.now() + 30_000);
    const a = await tab();
    const b = await tab();
    await a.boot();
    await b.boot();
    const request = (client: FakeClient | null) =>
      client?.opts.fetchFn(`${HOMESERVER}/_matrix/client/v3/sync`, { headers: { Authorization: 'Bearer syt_dev1' } });

    await Promise.all([request(a.client()), request(b.client())]);
    await vi.waitFor(() => expect(b.client()?.setAccessToken).toHaveBeenCalledWith('syt_renewed_1'));

    expect(server.to('/refresh').map(r => r.body)).toEqual([{ refresh_token: 'syr_dev1' }]);
    expect(a.client()?.setAccessToken).toHaveBeenCalledWith('syt_renewed_1');
    expect(server.to('/login')).toHaveLength(0);
  });

  it('a refused renewal of the shared device ends it and signs in again, and the other tab follows', async () => {
    const server = scriptChatServer(403);
    vi.stubGlobal('fetch', server.fetchStub);
    await seed(Date.now() + 30_000);
    const a = await tab();
    const b = await tab();
    await a.boot();
    await b.boot();

    await a.client()?.opts.fetchFn(`${HOMESERVER}/_matrix/client/v3/sync`, {});
    await vi.waitFor(() => expect(b.client()?.opts.deviceId).toBe('DEV_NEW_1'));

    expect(a.client()?.opts.deviceId).toBe('DEV_NEW_1');
    expect(server.to('/logout').map(r => r.token)).toEqual(['syt_dev1']);
    expect(server.to('/login')).toHaveLength(1);
  });
});
