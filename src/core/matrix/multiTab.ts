/**
 * E4 — single sync ownership per user per browser profile (contract §5).
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

interface MultiTabCallbacks {
  /** Fired when a queued follower acquires the lock (leader takeover). Never fired for the initial leader. */
  readonly onPromoted?: () => void;
  /** A remote leader's lifecycle state (messages `leader` and `state`). */
  readonly onRemoteState?: (state: string) => void;
  /** Another tab signed out; this tab must stop and clear. */
  readonly onRemoteLogout?: () => void;
}

interface MultiTabCoordinator {
  readonly role: () => TabRole;
  /** Leader announcement after promotion: `{type: "leader", state}`. */
  readonly announceLeadership: (state: string) => void;
  /** Lifecycle fan-out on every transition: `{type: "state", state}`. */
  readonly broadcastState: (state: string) => void;
  /** Release the lock (promoting the next queued tab) and close the channel. */
  readonly release: () => void;
}

const lockName = (userId: string): string => `alkemio-matrix-sync-${userId}`;
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

export { createMultiTabCoordinator };
export type { MultiTabCoordinator, MultiTabCallbacks, TabRole, MultiTabMessage };
