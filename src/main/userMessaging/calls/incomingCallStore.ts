import { useSyncExternalStore } from 'react';

/**
 * The user's conversations with a call running that the user is not in, keyed
 * by Alkemio room id, each with the caller's name for a direct conversation or
 * the group's name (null when it has none). A module-level store so the unread signals (header dot,
 * tab title) can read it without watching the calls themselves: the one
 * always-mounted watcher writes it.
 */
type Listener = () => void;

type IncomingCall = { readonly name: string; readonly isGroup: boolean };

type IncomingCallRooms = ReadonlyMap<string, IncomingCall | null>;

const NONE: IncomingCallRooms = new Map();

let current: IncomingCallRooms = NONE;
const listeners = new Set<Listener>();

const sameRooms = (a: IncomingCallRooms, b: IncomingCallRooms): boolean =>
  a.size === b.size &&
  [...a].every(([roomId, call]) => {
    const other = b.get(roomId);
    return b.has(roomId) && other?.name === call?.name && other?.isGroup === call?.isGroup;
  });

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

export type { IncomingCall, IncomingCallRooms };
export { getIncomingCallRooms, setIncomingCallRooms, subscribeIncomingCallRooms, useIncomingCallRooms };
