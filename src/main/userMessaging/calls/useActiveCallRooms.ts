import { useEffect, useState } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { resolveMatrixRoomId } from '@/main/userMessaging/matrix/matrixRooms';
import { isCallsConfigured } from './callConfig';
import { watchLiveMemberships } from './matrixRtc';
import { type CallableConversation, isBetaTester, useIsSynced } from './useCallEligibility';

const NONE: ReadonlySet<string> = new Set();

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>): boolean =>
  a.size === b.size && [...a].every(id => b.has(id));

/**
 * The Alkemio room ids of the group conversations with a call running, for
 * the conversation list's call badge. Empty for anyone the call controls are
 * hidden from (not a beta tester, or the environment has no calls).
 */
const useActiveCallRooms = (conversations: readonly CallableConversation[]): ReadonlySet<string> => {
  const { platformRoles } = useCurrentUserContext();
  const client = useMatrixClient();
  const isSynced = useIsSynced(client);
  const enabled = isBetaTester(platformRoles) && isCallsConfigured();
  // A stable key, so the effect re-runs only when the set of group rooms changes.
  const roomsKey = enabled
    ? conversations
        .filter(conversation => conversation.isGroup && !conversation.isGuidance)
        .map(conversation => conversation.roomId)
        .sort()
        .join('\n')
    : '';
  const [active, setActive] = useState<ReadonlySet<string>>(NONE);

  // Rooms are looked up once the session is synced, and again each time it syncs anew, so a
  // room whose lookup failed while the chat server was unreachable gets its badge later.
  useEffect(() => {
    if (!client || roomsKey === '') {
      setActive(NONE);
      return;
    }
    if (!isSynced) {
      // The badges shown stay until the session syncs again and they are re-read.
      return;
    }
    let cancelled = false;
    let stopWatching: (() => void) | undefined;
    const alkemioByMatrixId = new Map<string, string>();
    void Promise.all(
      roomsKey.split('\n').map(async alkemioRoomId => {
        const matrixRoomId = await resolveMatrixRoomId(client, alkemioRoomId);
        if (matrixRoomId) {
          alkemioByMatrixId.set(matrixRoomId, alkemioRoomId);
        }
      })
    ).then(() => {
      if (cancelled) {
        return;
      }
      stopWatching = watchLiveMemberships(client, [...alkemioByMatrixId.keys()], live => {
        const next = new Set(
          [...alkemioByMatrixId].flatMap(([matrixRoomId, alkemioRoomId]) =>
            (live.get(matrixRoomId)?.length ?? 0) > 0 ? [alkemioRoomId] : []
          )
        );
        setActive(previous => (sameSet(previous, next) ? previous : next));
      });
    });
    return () => {
      cancelled = true;
      stopWatching?.();
    };
  }, [client, isSynced, roomsKey]);

  return active;
};

export { useActiveCallRooms };
