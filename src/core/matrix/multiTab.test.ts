import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMultiTabCoordinator } from './multiTab';

const USER_ID = '@tabs-user:matrix.dev-alkem.io';

/** BroadcastChannel mock that actually delivers to the OTHER instances of the same name (never the sender). */
class DeliveringBroadcastChannel {
  static registry = new Map<string, Set<DeliveringBroadcastChannel>>();
  readonly name: string;
  private listeners: ((event: { data: unknown }) => void)[] = [];

  constructor(name: string) {
    this.name = name;
    const peers = DeliveringBroadcastChannel.registry.get(name) ?? new Set();
    peers.add(this);
    DeliveringBroadcastChannel.registry.set(name, peers);
  }

  addEventListener(type: string, listener: (event: { data: unknown }) => void): void {
    if (type === 'message') {
      this.listeners.push(listener);
    }
  }

  postMessage(data: unknown): void {
    for (const peer of DeliveringBroadcastChannel.registry.get(this.name) ?? []) {
      if (peer !== this) {
        for (const listener of peer.listeners) {
          listener({ data });
        }
      }
    }
  }

  close(): void {
    DeliveringBroadcastChannel.registry.get(this.name)?.delete(this);
  }
}

/** Minimal Web Locks manager: exclusive per name, ifAvailable probe, FIFO queue, release-on-settle. */
class FakeLockManager {
  private held = new Set<string>();
  private queues = new Map<string, (() => void)[]>();

  request = (
    name: string,
    optionsOrCallback: { ifAvailable?: boolean } | ((lock: unknown) => unknown),
    maybeCallback?: (lock: unknown) => unknown
  ): Promise<unknown> => {
    const options = typeof optionsOrCallback === 'function' ? {} : optionsOrCallback;
    const callback = typeof optionsOrCallback === 'function' ? optionsOrCallback : maybeCallback;
    if (!callback) {
      return Promise.reject(new TypeError('callback required'));
    }

    return new Promise((resolve, reject) => {
      const grant = () => {
        this.held.add(name);
        Promise.resolve(callback({ name, mode: 'exclusive' })).then(
          value => {
            this.releaseNext(name);
            resolve(value);
          },
          error => {
            this.releaseNext(name);
            reject(error);
          }
        );
      };

      if (!this.held.has(name)) {
        grant();
      } else if (options.ifAvailable) {
        Promise.resolve(callback(null)).then(resolve, reject);
      } else {
        const queue = this.queues.get(name) ?? [];
        queue.push(grant);
        this.queues.set(name, queue);
      }
    });
  };

  private releaseNext(name: string): void {
    this.held.delete(name);
    const next = this.queues.get(name)?.shift();
    next?.();
  }
}

describe('multiTab (E4 — single sync ownership)', () => {
  let locks: FakeLockManager;

  beforeEach(() => {
    DeliveringBroadcastChannel.registry.clear();
    (globalThis as Record<string, unknown>).BroadcastChannel = DeliveringBroadcastChannel;
    locks = new FakeLockManager();
    Object.defineProperty(navigator, 'locks', {
      value: { request: locks.request },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).BroadcastChannel;
    // @ts-expect-error — restore the jsdom default (no Web Locks)
    delete navigator.locks;
    vi.restoreAllMocks();
  });

  it('elects the first tab leader; the second stays follower', async () => {
    const promotedA = vi.fn();
    const promotedB = vi.fn();

    const tabA = await createMultiTabCoordinator(USER_ID, { onPromoted: promotedA });
    const tabB = await createMultiTabCoordinator(USER_ID, { onPromoted: promotedB });

    expect(tabA.role()).toBe('leader');
    expect(tabB.role()).toBe('follower');
    expect(promotedB).not.toHaveBeenCalled();
    // The initially granted tab is leader from construction — onPromoted is the takeover signal only.
    expect(promotedA).not.toHaveBeenCalled();

    tabA.release();
    tabB.release();
  });

  it('uses the frozen lock name alkemio-matrix-sync-{userId}', async () => {
    const requestSpy = vi.spyOn(locks, 'request');
    Object.defineProperty(navigator, 'locks', {
      value: { request: requestSpy },
      writable: true,
      configurable: true,
    });

    const tab = await createMultiTabCoordinator(USER_ID, {});
    expect(requestSpy.mock.calls[0][0]).toBe(`alkemio-matrix-sync-${USER_ID}`);
    tab.release();
  });

  it('fans leader state out to followers, never back to the sender', async () => {
    const remoteStatesA: string[] = [];
    const remoteStatesB: string[] = [];

    const tabA = await createMultiTabCoordinator(USER_ID, { onRemoteState: s => remoteStatesA.push(s) });
    const tabB = await createMultiTabCoordinator(USER_ID, { onRemoteState: s => remoteStatesB.push(s) });

    tabA.broadcastState('syncing');
    tabA.announceLeadership('ready');

    expect(remoteStatesB).toEqual(['syncing', 'ready']);
    expect(remoteStatesA).toEqual([]);

    tabA.release();
    tabB.release();
  });

  it('logout fan-out reaches every listening tab', async () => {
    const logoutA = vi.fn();
    const logoutB = vi.fn();

    const tabA = await createMultiTabCoordinator(USER_ID, { onRemoteLogout: logoutA });
    const tabB = await createMultiTabCoordinator(USER_ID, { onRemoteLogout: logoutB });

    // The sign-out flow (logoutCleanup) posts on the frozen channel name directly.
    const channel = new DeliveringBroadcastChannel(`alkemio-matrix-${USER_ID}`);
    channel.postMessage({ type: 'logout' });

    expect(logoutA).toHaveBeenCalledOnce();
    expect(logoutB).toHaveBeenCalledOnce();

    tabA.release();
    tabB.release();
  });

  it('lock release promotes the next queued tab (leader crash/close → takeover)', async () => {
    const promotedB = vi.fn();

    const tabA = await createMultiTabCoordinator(USER_ID, {});
    const tabB = await createMultiTabCoordinator(USER_ID, { onPromoted: promotedB });
    expect(tabB.role()).toBe('follower');

    tabA.release();

    await vi.waitFor(() => {
      expect(promotedB).toHaveBeenCalledOnce();
    });
    expect(tabB.role()).toBe('leader');

    tabB.release();
  });

  it('degrades to immediate single-tab leadership when Web Locks is unavailable', async () => {
    // @ts-expect-error — simulate a browser without the API
    delete navigator.locks;

    const tab = await createMultiTabCoordinator(USER_ID, {});
    expect(tab.role()).toBe('leader');
    tab.release();
  });
});
