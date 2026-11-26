import { ClientEvent, type MatrixClient, type MatrixEvent, type User } from 'matrix-js-sdk';
import { useRef, useState, useSyncExternalStore } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import type { UserPresence } from '../models';
import { homeserverOf } from './matrixRooms';
import { setPresenceRetryingOnce, showOnlineOf } from './useShowOnlinePreference';

/** A person's availability and the status message they set, if any. */
export type UserStatus = { presence: UserPresence; statusMessage?: string };

const noop = () => {};

// The client re-emits each m.presence after its User is in the store. The User's
// own events fire before a newly met User is stored, and Presence only fires when
// the state changes, so a new status message alone would go unnoticed.
const subscribeToPresence = (client: MatrixClient | null) => (listener: () => void) => {
  if (!client) {
    return noop;
  }
  const onEvent = (event: MatrixEvent) => {
    if (event.getType() === 'm.presence') {
      listener();
    }
  };
  client.on(ClientEvent.Event, onEvent);
  return () => client.removeListener(ClientEvent.Event, onEvent);
};

// Read from the event itself: the SDK keeps User.presenceStatusMsg when a later
// event clears the message.
const statusMessageOf = (user: User | null): string => user?.events.presence?.getContent().status_msg?.trim() ?? '';

const presenceOf = (user: User): UserPresence => {
  switch (user.presence) {
    case 'online':
      return 'online';
    case 'unavailable':
      return 'away';
    case 'offline':
      return 'offline';
    default:
      return 'unknown';
  }
};

// Only a received m.presence counts: the SDK defaults a User it built from room
// state to 'offline', and a homeserver with presence disabled sends none at all.
const statusOf = (user: User | null): UserStatus => {
  if (!user?.events.presence) {
    return { presence: 'unknown' };
  }
  return { presence: presenceOf(user), statusMessage: statusMessageOf(user) || undefined };
};

/** Live Matrix presence and status message per actor id; 'unknown' without a client or a presence event. */
export const useMatrixPresence = (actorIds: readonly string[]): ReadonlyMap<string, UserStatus> => {
  const client = useMatrixClient();
  const readSnapshot = () =>
    JSON.stringify(
      actorIds.map(actorId =>
        client ? statusOf(client.getUser(`@${actorId}:${homeserverOf(client)}`)) : { presence: 'unknown' }
      )
    );
  // A string snapshot compares by value, so an unrelated emit does not re-render.
  const snapshot = useSyncExternalStore(subscribeToPresence(client), readSnapshot, readSnapshot);
  const statuses = JSON.parse(snapshot) as UserStatus[];
  return new Map(actorIds.map((actorId, index) => [actorId, statuses[index]]));
};

/** The signed-in user's own status message, live, and a setter; an empty message clears it. */
export const useOwnStatusMessage = () => {
  const client = useMatrixClient();
  const readSnapshot = () => {
    const userId = client?.getUserId();
    return client && userId ? statusMessageOf(client.getUser(userId)) : '';
  };
  const synced = useSyncExternalStore(subscribeToPresence(client), readSnapshot, readSnapshot);
  // What the user just saved, shown until the homeserver has taken it.
  const [pending, setPending] = useState<string | null>(null);
  // Counts saves, so one that a newer save overtook neither sends nor clears.
  const latestSave = useRef(0);

  // Rejects when there is no client or the homeserver refuses the update.
  const setStatusMessage = async (text: string) => {
    if (!client) {
      throw new Error('Chat is not connected');
    }
    // Setting a message also says 'online', which the "Show when I'm online" setting forbids.
    if (!showOnlineOf(client)) {
      return;
    }
    const update = { presence: 'online' as const, status_msg: text.trim().slice(0, 100) };
    latestSave.current += 1;
    const save = latestSave.current;
    setPending(update.status_msg);
    try {
      // A newer save now owns the value; sending this one late would undo it.
      await setPresenceRetryingOnce(client, update, () => save === latestSave.current);
    } finally {
      if (save === latestSave.current) {
        setPending(null);
      }
    }
  };

  return { statusMessage: pending ?? synced, setStatusMessage };
};
