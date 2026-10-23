import { useEffect, useState } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { CLIENT_ROOM, resolveMatrixRoomId } from '@/main/userMessaging/matrix/matrixRooms';
import { isCallsConfigured } from './callConfig';
import {
  liveMemberships,
  MEMBERSHIPS_CHANGED,
  nextExpiryMs,
  rtcOf,
  SESSION_ENDED,
  SESSION_STARTED,
  type SessionLike,
  sessionOf,
} from './matrixRtc';
import { type CallableConversation, isBetaTester } from './useCallEligibility';

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

  useEffect(() => {
    if (!client || roomsKey === '') {
      setActive(NONE);
      return;
    }
    let cancelled = false;
    const alkemioByMatrixId = new Map<string, string>();
    const sessions = new Map<string, SessionLike>();
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;

    const evaluate = (): void => {
      clearTimeout(expiryTimer);
      expiryTimer = undefined;
      const next = new Set<string>();
      let untilExpiry: number | undefined;
      for (const [matrixRoomId, alkemioRoomId] of alkemioByMatrixId) {
        const session = sessionOf(client, matrixRoomId);
        const known = sessions.get(matrixRoomId);
        if (session !== known) {
          known?.off(MEMBERSHIPS_CHANGED, evaluate);
          session?.on(MEMBERSHIPS_CHANGED, evaluate);
          if (session) {
            sessions.set(matrixRoomId, session);
          } else {
            sessions.delete(matrixRoomId);
          }
        }
        const live = liveMemberships(session);
        if (live.length > 0) {
          next.add(alkemioRoomId);
        }
        const roomExpiry = nextExpiryMs(live);
        if (roomExpiry !== undefined) {
          untilExpiry = untilExpiry === undefined ? roomExpiry : Math.min(untilExpiry, roomExpiry);
        }
      }
      setActive(previous => (sameSet(previous, next) ? previous : next));
      if (untilExpiry !== undefined) {
        expiryTimer = setTimeout(evaluate, untilExpiry);
      }
    };

    void Promise.all(
      roomsKey.split('\n').map(async alkemioRoomId => {
        const matrixRoomId = await resolveMatrixRoomId(client, alkemioRoomId);
        if (matrixRoomId) {
          alkemioByMatrixId.set(matrixRoomId, alkemioRoomId);
        }
      })
    ).then(() => {
      if (!cancelled) {
        evaluate();
      }
    });

    const rtc = rtcOf(client);
    rtc.on(SESSION_STARTED, evaluate);
    rtc.on(SESSION_ENDED, evaluate);
    client.on(CLIENT_ROOM as never, evaluate as never);
    return () => {
      cancelled = true;
      clearTimeout(expiryTimer);
      for (const session of sessions.values()) {
        session.off(MEMBERSHIPS_CHANGED, evaluate);
      }
      rtc.off(SESSION_STARTED, evaluate);
      rtc.off(SESSION_ENDED, evaluate);
      client.removeListener(CLIENT_ROOM as never, evaluate as never);
    };
  }, [client, roomsKey]);

  return active;
};

export { useActiveCallRooms };
