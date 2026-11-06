import { useSyncExternalStore } from 'react';

/**
 * The calls the user has already dealt with (opened the conversation while it
 * ran, joined, or left), so no tab alerts for them again. Kept in localStorage
 * and followed through the `storage` event, so a call dealt with in one tab
 * stops alerting in every other tab; kept in memory too, so it still works for
 * the tab when storage is unavailable.
 *
 * A call is told apart from a later call in the same room by its memberships'
 * creation times (the server's clock): each entry holds the latest creation time
 * seen among the call's members when it was dealt with. A call still running has
 * a member from back then, so its earliest live membership is no later than that;
 * a new call's members all joined after the old one ended, so it alerts again.
 */
type Listener = () => void;

type CallDismissal = {
  /** The latest membership creation time seen in the call, in ms (server clock). */
  readonly upTo: number;
  /** When this tab last wrote the entry, in ms (local clock); only for pruning. */
  readonly at: number;
};

type CallDismissals = Readonly<Record<string, CallDismissal>>;

const STORAGE_KEY = 'alkemio.calls.dismissed';
// Long past any call; old entries are dropped on the next write.
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const isDismissal = (value: unknown): value is CallDismissal =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as CallDismissal).upTo === 'number' &&
  typeof (value as CallDismissal).at === 'number';

const readStored = (): CallDismissals => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (typeof parsed !== 'object' || parsed === null) {
      return {};
    }
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => isDismissal(value)));
  } catch {
    return {};
  }
};

/** Both sets, keeping the later entry per room: a tab whose write failed keeps its own. */
const merge = (a: CallDismissals, b: CallDismissals): CallDismissals => {
  const merged: Record<string, CallDismissal> = { ...a };
  for (const [roomId, entry] of Object.entries(b)) {
    const known = merged[roomId];
    if (!known || entry.upTo > known.upTo) {
      merged[roomId] = entry;
    }
  }
  return merged;
};

let current: CallDismissals | undefined;
const listeners = new Set<Listener>();

const getCallDismissals = (): CallDismissals => {
  current ??= readStored();
  return current;
};

const notify = (): void => {
  for (const listener of listeners) {
    listener();
  }
};

const onStorage = (event: StorageEvent): void => {
  // A null key means another tab cleared the storage.
  if (event.key !== null && event.key !== STORAGE_KEY) {
    return;
  }
  current = merge(getCallDismissals(), readStored());
  notify();
};

const isCallDismissed = (dismissals: CallDismissals, roomId: string, startedTs: number): boolean => {
  const entry = dismissals[roomId];
  return entry !== undefined && startedTs <= entry.upTo;
};

/** Records the room's call as dealt with up to `latestTs`; writes nothing when that is already known. */
const dismissCall = (roomId: string, latestTs: number): void => {
  const known = getCallDismissals();
  if ((known[roomId]?.upTo ?? Number.NEGATIVE_INFINITY) >= latestTs) {
    return;
  }
  const now = Date.now();
  const next = merge(known, readStored());
  current = Object.fromEntries(
    Object.entries({ ...next, [roomId]: { upTo: latestTs, at: now } }).filter(
      ([, entry]) => now - entry.at < MAX_AGE_MS
    )
  );
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage unavailable or full: this tab still remembers it.
  }
  notify();
};

const subscribeCallDismissals = (listener: Listener): (() => void) => {
  if (listeners.size === 0) {
    window.addEventListener('storage', onStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('storage', onStorage);
    }
  };
};

const NONE: CallDismissals = {};

const useCallDismissals = (): CallDismissals =>
  useSyncExternalStore(subscribeCallDismissals, getCallDismissals, () => NONE);

export type { CallDismissals };
export { dismissCall, isCallDismissed, useCallDismissals };
