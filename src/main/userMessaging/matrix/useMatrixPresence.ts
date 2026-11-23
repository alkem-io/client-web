import { type MatrixClient, type User, UserEvent } from 'matrix-js-sdk';
import { useSyncExternalStore } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import type { UserPresence } from '../models';
import { homeserverOf } from './matrixRooms';

/** A person's availability and the status message they set, if any. */
export type UserStatus = { presence: UserPresence; statusMessage?: string };

const noop = () => {};

// The SDK emits LastPresenceTs for every presence event; Presence only when the
// state changes, so a new status message alone would go unnoticed.
const subscribeToPresence = (client: MatrixClient | null) => (listener: () => void) => {
  if (!client) {
    return noop;
  }
  client.on(UserEvent.LastPresenceTs, listener);
  return () => client.removeListener(UserEvent.LastPresenceTs, listener);
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
  const statusMessage = useSyncExternalStore(subscribeToPresence(client), readSnapshot, readSnapshot);

  // Rejects when there is no client or the homeserver refuses the update.
  const setStatusMessage = async (text: string) => {
    if (!client) {
      throw new Error('Chat is not connected');
    }
    await client.setPresence({ presence: 'online', status_msg: text.trim().slice(0, 100) });
  };

  return { statusMessage, setStatusMessage };
};
