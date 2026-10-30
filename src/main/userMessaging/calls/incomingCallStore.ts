import { useSyncExternalStore } from 'react';

/**
 * The user's conversations with a call running that the user is not in, keyed
 * by Alkemio room id, each with the caller's name for a direct conversation
 * (null for a group). A module-level store so the unread signals (header dot,
 * tab title) can read it without watching the calls themselves: the one
 * always-mounted watcher writes it.
 */
type Listener = () => void;

type IncomingCallRooms = ReadonlyMap<string, string | null>;

const NONE: IncomingCallRooms = new Map();

let current: IncomingCallRooms = NONE;
const listeners = new Set<Listener>();

const sameRooms = (a: IncomingCallRooms, b: IncomingCallRooms): boolean =>
  a.size === b.size && [...a].every(([roomId, caller]) => b.has(roomId) && b.get(roomId) === caller);

const setIncomingCallRooms = (next: IncomingCallRooms): void => {
  if (sameRooms(current, next)) {
    return;
  }
  current = next;
  for (const listener of listeners) {
    listener();
  }
};

const getIncomingCallRooms = (): IncomingCallRooms => current;

const subscribeIncomingCallRooms = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const useIncomingCallRooms = (): IncomingCallRooms =>
  useSyncExternalStore(subscribeIncomingCallRooms, getIncomingCallRooms, () => NONE);

export type { IncomingCallRooms };
export { getIncomingCallRooms, setIncomingCallRooms, subscribeIncomingCallRooms, useIncomingCallRooms };
