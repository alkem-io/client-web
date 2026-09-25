/**
 * Single sync ownership per user per browser profile.
 *
 * Leader election rides the Web Locks API: the tab holding the exclusive lock
 * `alkemio-matrix-sync-{userId}` is the one tab that may instantiate a syncing
 * SDK client. Everyone else queues; the browser releases the lock on tab
 * close/crash and the next queued tab promotes. Lifecycle state and logout fan
 * out over the BroadcastChannel `alkemio-matrix-{userId}` (both names frozen).
 *
 * Where Web Locks is unavailable the coordinator degrades to single-tab
 * behavior: this tab is immediately the leader.
 */

type TabRole = 'leader' | 'follower';

type MultiTabMessage = { type: 'leader'; state: string } | { type: 'state'; state: string } | { type: 'logout' };

type MultiTabCallbacks = {
  /** Fired when a queued follower acquires the lock (leader takeover). Never fired for the initial leader. */
  readonly onPromoted?: () => void;
  /** A remote leader's lifecycle state (messages `leader` and `state`). */
  readonly onRemoteState?: (state: string) => void;
  /** Another tab signed out; this tab must stop and clear. */
  readonly onRemoteLogout?: () => void;
};

type MultiTabCoordinator = {
  readonly role: () => TabRole;
  /** Leader announcement after promotion: `{type: "leader", state}`. */
  readonly announceLeadership: (state: string) => void;
  /** Lifecycle fan-out on every transition: `{type: "state", state}`. */
  readonly broadcastState: (state: string) => void;
  /** Release the lock (promoting the next queued tab) and close the channel. */
  readonly release: () => void;
};

const lockName = (userId: string): string => `alkemio-matrix-sync-${userId}`;
const establishLockName = (actorId: string): string => `alkemio-matrix-establish-${actorId.toLowerCase()}`;

/**
 * Serializes credential acquisition (refresh, silent SSO) across this actor's
 * tabs. The sync lock cannot do it: it is keyed by the Matrix userId, which a
 * tab without stored credentials does not know until its own SSO completes.
 * Without Web Locks the callback simply runs (single-tab degradation).
 */
const withEstablishLock = <T>(actorId: string, task: () => Promise<T>): Promise<T> => {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  if (!locks?.request) {
    return task();
  }
  return locks.request(establishLockName(actorId), task) as Promise<T>;
};
const channelName = (userId: string): string => `alkemio-matrix-${userId}`;

const createMultiTabCoordinator = async (
  userId: string,
  callbacks: MultiTabCallbacks = {}
): Promise<MultiTabCoordinator> => {
  let role: TabRole = 'follower';
  let released = false;
  let releaseLock: (() => void) | null = null;

  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName(userId)) : null;
  channel?.addEventListener('message', event => {
    const message = event.data as MultiTabMessage | undefined;
    if (!message || typeof message !== 'object') {
      return;
    }
    if (message.type === 'logout') {
      callbacks.onRemoteLogout?.();
      return;
    }
    if ((message.type === 'leader' || message.type === 'state') && role === 'follower') {
      callbacks.onRemoteState?.(message.state);
    }
  });

  const post = (message: MultiTabMessage): void => {
    try {
      channel?.postMessage(message);
    } catch {
      // A closed channel or serialization hiccup never breaks the session.
    }
  };

  const holdLock = (): Promise<void> => new Promise<void>(resolve => (releaseLock = resolve));

  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  if (locks?.request) {
    // Probe without waiting so the caller knows its initial role deterministically.
    const acquiredNow = await new Promise<boolean>(resolve => {
      locks
        .request(lockName(userId), { ifAvailable: true }, lock => {
          if (!lock) {
            resolve(false);
            return undefined;
          }
          role = 'leader';
          resolve(true);
          return holdLock();
        })
        .catch(() => resolve(false));
    });

    if (!acquiredNow) {
      // Queue for takeover; the browser grants on the current leader's release/close/crash.
      locks
        .request(lockName(userId), () => {
          if (released) {
            return undefined;
          }
          role = 'leader';
          callbacks.onPromoted?.();
          return holdLock();
        })
        .catch(() => {});
    }
  } else {
    role = 'leader';
  }

  return {
    role: () => role,
    announceLeadership: state => post({ type: 'leader', state }),
    broadcastState: state => post({ type: 'state', state }),
    release: () => {
      released = true;
      releaseLock?.();
      channel?.close();
    },
  };
};

// Alkemio sign-out is profile-wide (one Kratos session per profile), so it is
// announced on a profile-wide channel too: a tab still acquiring credentials
// has no per-user channel yet and would otherwise miss the per-user logout.
const SIGN_OUT_CHANNEL = 'alkemio-matrix-signout';

const broadcastProfileSignOut = (): void => {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  try {
    const channel = new BroadcastChannel(SIGN_OUT_CHANNEL);
    channel.postMessage({ type: 'signout' });
    channel.close();
  } catch {
    // Opportunistic, like the per-user fan-out.
  }
};

const onProfileSignOut = (listener: () => void): (() => void) => {
  if (typeof BroadcastChannel === 'undefined') {
    return () => {};
  }
  const channel = new BroadcastChannel(SIGN_OUT_CHANNEL);
  channel.addEventListener('message', event => {
    if ((event.data as { type?: string } | undefined)?.type === 'signout') {
      listener();
    }
  });
  return () => channel.close();
};

export { broadcastProfileSignOut, createMultiTabCoordinator, onProfileSignOut, withEstablishLock };
export type { MultiTabCoordinator, MultiTabCallbacks, TabRole, MultiTabMessage };
