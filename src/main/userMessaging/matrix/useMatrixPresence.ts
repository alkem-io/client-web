import { type User, UserEvent } from 'matrix-js-sdk';
import { useSyncExternalStore } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import type { UserPresence } from '../models';
import { homeserverOf } from './matrixRooms';

const noop = () => {};

// Only a received m.presence counts: the SDK defaults a User it built from room
// state to 'offline', and a homeserver with presence disabled sends none at all.
const presenceOf = (user: User | null): UserPresence => {
  if (!user?.events.presence) {
    return 'unknown';
  }
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

/** Live Matrix presence per actor id; 'unknown' without a client or a presence event. */
export const useMatrixPresence = (actorIds: readonly string[]): ReadonlyMap<string, UserPresence> => {
  const client = useMatrixClient();
  const readSnapshot = () =>
    actorIds
      .map(actorId => (client ? presenceOf(client.getUser(`@${actorId}:${homeserverOf(client)}`)) : 'unknown'))
      .join(',');
  // A string snapshot compares by value, so an unrelated emit does not re-render.
  const snapshot = useSyncExternalStore(
    listener => {
      if (!client) {
        return noop;
      }
      client.on(UserEvent.Presence, listener);
      return () => client.removeListener(UserEvent.Presence, listener);
    },
    readSnapshot,
    readSnapshot
  );
  const presences = snapshot.split(',') as UserPresence[];
  return new Map(actorIds.map((actorId, index) => [actorId, presences[index]]));
};
