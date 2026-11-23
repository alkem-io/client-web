import type { CredentialRecord } from './storage';

/**
 * All tabs of one browser share one chat device per user. Two primitives keep
 * them together:
 *
 * - One cross-tab lock per user, held by every change to the stored credential:
 *   acquiring one, renewing it, replacing it, and clearing it. Inside the lock a
 *   writer re-reads storage, so a credential another tab stored is reused instead
 *   of a second device being created.
 * - One channel for the whole origin, over which a tab with nothing stored asks
 *   the running tabs for their credential, and over which a sign-out or a
 *   deliberate device change reaches every tab at once.
 *
 * The lock is keyed by the Matrix localpart, lowercased: acquisition knows the
 * Alkemio actor id, which is that localpart, and renewal knows the Matrix user
 * id `@<localpart>:<server>`, from which it is read back.
 */

// How long a tab with nothing stored waits for a running tab to answer.
const ASK_WAIT_MS = 500;
const CHANNEL_NAME = 'alkemio-matrix';

type TabMessage =
  | { readonly type: 'ask'; readonly id: string; readonly localpart: string }
  | { readonly type: 'live'; readonly id: string; readonly record: CredentialRecord }
  | { readonly type: 'changed'; readonly record: CredentialRecord }
  | { readonly type: 'signed-out'; readonly deviceIds: readonly string[] };

const localpartOf = (userId: string): string => userId.slice(1, userId.indexOf(':')).toLowerCase();

const lockName = (localpart: string): string => `alkemio-matrix/${localpart.toLowerCase()}`;

/** Without Web Locks, writers in different tabs cannot be ordered, so tabs do not coordinate. */
const canCoordinate = (): boolean => 'locks' in navigator;

/**
 * Runs `task` while holding the user's credential lock. With `waitMs`, a lock
 * not granted in time runs `task` anyway: for a sign-out, which must never wait
 * on another tab.
 */
const withCredentialLock = async <T>(localpart: string, task: () => Promise<T>, waitMs?: number): Promise<T> => {
  if (!canCoordinate()) {
    return task();
  }
  if (waitMs === undefined) {
    return navigator.locks.request(lockName(localpart), task);
  }
  const wait = new AbortController();
  const timer = setTimeout(() => wait.abort(), waitMs);
  let granted = false;
  try {
    return await navigator.locks.request(lockName(localpart), { signal: wait.signal }, () => {
      granted = true;
      clearTimeout(timer);
      return task();
    });
  } catch (error) {
    if (granted) {
      throw error;
    }
    return task();
  } finally {
    clearTimeout(timer);
  }
};

const openChannel = (): BroadcastChannel | null =>
  typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME);

const post = (message: TabMessage): void => {
  const channel = openChannel();
  channel?.postMessage(message);
  channel?.close();
};

// The record must be complete and belong to the user: a partial one would be resumed unchecked.
const isRecordOf = (record: unknown, localpart: string): record is CredentialRecord => {
  const candidate = record as Partial<CredentialRecord> | null;
  return (
    typeof candidate?.userId === 'string' &&
    localpartOf(candidate.userId) === localpart.toLowerCase() &&
    typeof candidate.deviceId === 'string' &&
    candidate.deviceId !== '' &&
    typeof candidate.accessToken === 'string' &&
    candidate.accessToken !== '' &&
    typeof candidate.homeserverUrl === 'string'
  );
};

// This tab's own questions, so its own listener does not answer them.
const ownAsks = new Set<string>();

/**
 * Asks the other tabs for the credential they are running on. Resolves the
 * first answer, or null when none comes within ASK_WAIT_MS or `signal` aborts.
 */
const askOtherTabs = (localpart: string, signal: AbortSignal): Promise<CredentialRecord | null> =>
  new Promise(resolve => {
    const channel = openChannel();
    if (!channel || signal.aborted) {
      channel?.close();
      resolve(null);
      return;
    }
    const id = crypto.randomUUID();
    const done = (record: CredentialRecord | null): void => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      ownAsks.delete(id);
      channel.close();
      resolve(record);
    };
    const onAbort = () => done(null);
    const timer = setTimeout(onAbort, ASK_WAIT_MS);
    signal.addEventListener('abort', onAbort);
    channel.addEventListener('message', ({ data }: MessageEvent<TabMessage>) => {
      if (data?.type === 'live' && data.id === id && isRecordOf(data.record, localpart)) {
        done(data.record);
      }
    });
    ownAsks.add(id);
    channel.postMessage({ type: 'ask', id, localpart } satisfies TabMessage);
  });

/** Tells the other tabs this user's device was replaced, so they move to `record`. */
const announceDeviceChanged = (record: CredentialRecord): void => post({ type: 'changed', record });

/** Tells every tab the browser signed out; `deviceIds` are the devices this sign-out logs out. */
const announceSignedOut = (deviceIds: readonly string[]): void => post({ type: 'signed-out', deviceIds });

type TabHandlers = {
  /** The credential this tab is running on, if any. */
  readonly running: () => CredentialRecord | null;
  readonly onDeviceChanged: (record: CredentialRecord) => void;
  readonly onSignedOut: (deviceIds: readonly string[]) => void;
};

/** Answers other tabs' questions for `localpart` and reacts to their announcements. Returns the unsubscribe. */
const listenToOtherTabs = (localpart: string, handlers: TabHandlers): (() => void) => {
  const channel = openChannel();
  if (!channel) {
    return () => undefined;
  }
  channel.addEventListener('message', ({ data }: MessageEvent<TabMessage>) => {
    switch (data?.type) {
      case 'ask': {
        const record = handlers.running();
        if (data.localpart === localpart.toLowerCase() && !ownAsks.has(data.id) && record) {
          channel.postMessage({ type: 'live', id: data.id, record } satisfies TabMessage);
        }
        return;
      }
      case 'changed':
        if (isRecordOf(data.record, localpart)) {
          handlers.onDeviceChanged(data.record);
        }
        return;
      case 'signed-out':
        handlers.onSignedOut(Array.isArray(data.deviceIds) ? data.deviceIds : []);
        return;
    }
  });
  return () => channel.close();
};

export {
  announceDeviceChanged,
  announceSignedOut,
  askOtherTabs,
  canCoordinate,
  listenToOtherTabs,
  localpartOf,
  withCredentialLock,
};
