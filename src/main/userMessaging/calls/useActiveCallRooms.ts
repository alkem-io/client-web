import { useEffect, useRef, useState } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { resolveMatrixRoomId } from '@/main/userMessaging/matrix/matrixRooms';
import { isCallsConfigured } from './callConfig';
import { type MembershipLike, watchLiveMemberships } from './matrixRtc';
import { type CallableConversation, isBetaTester, isCallableConversation, useIsSynced } from './useCallEligibility';

const NONE: ReadonlySet<string> = new Set();

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>): boolean =>
  a.size === b.size && [...a].every(id => b.has(id));

type ActiveCallRoomsOptions = {
  /** Only calls the current user is not in, on any device. */
  readonly withoutMe?: boolean;
  /** Called with the rooms whose call started while watching; calls already running when watching began are not reported. */
  readonly onStarted?: (alkemioRoomIds: readonly string[]) => void;
};

/**
 * The Alkemio room ids of the callable conversations with a call running, for
 * the conversation list's call badge. Empty for anyone the call controls are
 * hidden from (not a beta tester, or the environment has no calls).
 */
const useActiveCallRooms = (
  conversations: readonly CallableConversation[],
  { withoutMe = false, onStarted }: ActiveCallRoomsOptions = {}
): ReadonlySet<string> => {
  const { platformRoles } = useCurrentUserContext();
  const client = useMatrixClient();
  const isSynced = useIsSynced(client);
  const enabled = isBetaTester(platformRoles) && isCallsConfigured();
  // A stable key, so the effect re-runs only when the set of callable rooms changes.
  const roomsKey = enabled
    ? conversations
        .filter(isCallableConversation)
        .map(conversation => conversation.roomId)
        .sort()
        .join('\n')
    : '';
  const [active, setActive] = useState<ReadonlySet<string>>(NONE);
  // Read inside the watcher; synced post-commit so a new callback does not restart the watch.
  const onStartedRef = useRef(onStarted);
  useEffect(() => {
    onStartedRef.current = onStarted;
  }, [onStarted]);

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
      const myUserId = client.getUserId();
      const counts = (memberships: readonly MembershipLike[]): boolean =>
        memberships.length > 0 && !(withoutMe && memberships.some(membership => membership.sender === myUserId));
      // The first report is the state when watching began: nothing in it has just started.
      let reported: ReadonlySet<string> | undefined;
      stopWatching = watchLiveMemberships(client, [...alkemioByMatrixId.keys()], live => {
        const next = new Set(
          [...alkemioByMatrixId].flatMap(([matrixRoomId, alkemioRoomId]) =>
            counts(live.get(matrixRoomId) ?? []) ? [alkemioRoomId] : []
          )
        );
        const started = reported ? [...next].filter(alkemioRoomId => !reported?.has(alkemioRoomId)) : [];
        reported = next;
        setActive(previous => (sameSet(previous, next) ? previous : next));
        if (started.length > 0) {
          onStartedRef.current?.(started);
        }
      });
    });
    return () => {
      cancelled = true;
      stopWatching?.();
    };
  }, [client, isSynced, roomsKey, withoutMe]);

  return active;
};

export { useActiveCallRooms };
export type { ActiveCallRoomsOptions };
