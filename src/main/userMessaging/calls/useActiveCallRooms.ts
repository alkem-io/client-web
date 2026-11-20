import { useEffect, useState } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { resolveMatrixRoomId } from '@/main/userMessaging/matrix/matrixRooms';
import { isCallsConfigured } from './callConfig';
import { type MembershipLike, watchLiveMemberships } from './matrixRtc';
import { type CallableConversation, isBetaTester, isCallableConversation, useIsSynced } from './useCallEligibility';

/** A running call, as its live memberships describe it. */
type LiveCall = {
  /** The earliest creation time among the live memberships, in ms (server clock). */
  readonly startedTs: number;
  /** The latest creation time among the live memberships, in ms (server clock). */
  readonly latestTs: number;
  /** Whether the current user is in it, on any device. */
  readonly withMe: boolean;
};

type LiveCalls = ReadonlyMap<string, LiveCall>;

const NONE: LiveCalls = new Map();

const sameCalls = (a: LiveCalls, b: LiveCalls): boolean =>
  a.size === b.size &&
  [...a].every(([roomId, call]) => {
    const other = b.get(roomId);
    return (
      other !== undefined &&
      other.startedTs === call.startedTs &&
      other.latestTs === call.latestTs &&
      other.withMe === call.withMe
    );
  });

const describeCall = (memberships: readonly MembershipLike[], myUserId: string | null): LiveCall => {
  const created = memberships.map(membership => membership.createdTs());
  return {
    startedTs: Math.min(...created),
    latestTs: Math.max(...created),
    withMe: memberships.some(membership => membership.sender === myUserId),
  };
};

/**
 * The calls running in the callable conversations, keyed by Alkemio room id.
 * Empty for anyone the call controls are hidden from (not a beta tester, or the
 * environment has no calls).
 */
const useLiveCalls = (conversations: readonly CallableConversation[]): LiveCalls => {
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
  const [active, setActive] = useState<LiveCalls>(NONE);

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
      stopWatching = watchLiveMemberships(client, [...alkemioByMatrixId.keys()], live => {
        const next: LiveCalls = new Map(
          [...alkemioByMatrixId].flatMap(([matrixRoomId, alkemioRoomId]) => {
            const memberships = live.get(matrixRoomId) ?? [];
            return memberships.length > 0 ? [[alkemioRoomId, describeCall(memberships, myUserId)] as const] : [];
          })
        );
        setActive(previous => (sameCalls(previous, next) ? previous : next));
      });
    });
    return () => {
      cancelled = true;
      stopWatching?.();
    };
  }, [client, isSynced, roomsKey]);

  return active;
};

/** The Alkemio room ids of the callable conversations with a call running, for the conversation list's call badge. */
const useActiveCallRooms = (conversations: readonly CallableConversation[]): ReadonlySet<string> =>
  new Set(useLiveCalls(conversations).keys());

export { useActiveCallRooms, useLiveCalls };
export type { LiveCall, LiveCalls };
