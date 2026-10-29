import { useSyncExternalStore } from 'react';

/**
 * The Alkemio room ids of the user's conversations with a call running that
 * the user is not in. A module-level store so the unread signals (header dot,
 * tab title) can read it without watching the calls themselves: the one
 * always-mounted watcher writes it.
 */
type Listener = () => void;

const NONE: ReadonlySet<string> = new Set();

let current: ReadonlySet<string> = NONE;
const listeners = new Set<Listener>();

const setIncomingCallRooms = (next: ReadonlySet<string>): void => {
  if (current === next) {
    return;
  }
  current = next;
  for (const listener of listeners) {
    listener();
  }
};

const getIncomingCallRooms = (): ReadonlySet<string> => current;

const subscribeIncomingCallRooms = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const useIncomingCallRooms = (): ReadonlySet<string> =>
  useSyncExternalStore(subscribeIncomingCallRooms, getIncomingCallRooms, () => NONE);

export { getIncomingCallRooms, setIncomingCallRooms, subscribeIncomingCallRooms, useIncomingCallRooms };
