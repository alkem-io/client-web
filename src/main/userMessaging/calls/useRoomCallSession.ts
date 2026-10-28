import { useEffect, useState } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { CLIENT_ROOM } from '@/main/userMessaging/matrix/matrixRooms';
import { useCallOverlay } from './callOverlayStore';
import {
  liveMemberships,
  MEMBERSHIPS_CHANGED,
  type MembershipLike,
  nextExpiryMs,
  rtcOf,
  SESSION_ENDED,
  SESSION_STARTED,
  type SessionLike,
  sessionOf,
} from './matrixRtc';

type RoomCallSession = {
  /** Distinct users with at least one unexpired membership — people, not devices. */
  readonly participants: string[];
  readonly participantCount: number;
  /**
   * This browser's chat device is in the call. Every tab of a browser shares
   * that one device, so this holds in all of them, whichever tab joined.
   */
  readonly isJoinedOnThisDevice: boolean;
  /** This tab hosts the call of this room, and the device is in it. */
  readonly isJoinedHere: boolean;
};

type MembershipView = Omit<RoomCallSession, 'isJoinedHere'>;

const NO_CALL: MembershipView = { participants: [], participantCount: 0, isJoinedOnThisDevice: false };

const summarize = (live: MembershipLike[], userId: string | null, deviceId: string | null): MembershipView => {
  const participants = [...new Set(live.flatMap(membership => (membership.sender ? [membership.sender] : [])))];
  return {
    participants,
    participantCount: participants.length,
    // The embedded call UI joins with the session's own user and device, so its
    // membership is the one carrying both.
    isJoinedOnThisDevice: live.some(membership => membership.sender === userId && membership.deviceId === deviceId),
  };
};

const sameView = (a: MembershipView, b: MembershipView): boolean =>
  a.isJoinedOnThisDevice === b.isJoinedOnThisDevice && a.participants.join('\n') === b.participants.join('\n');

/**
 * The call running in one Matrix room, as the chat SDK tracks it. Expired
 * memberships (a participant whose device vanished without leaving) are never
 * counted, and the view re-evaluates when the nearest one expires, so a
 * crashed participant drops out without waiting for another sync.
 */
const useRoomCallSession = (matrixRoomId: string | null): RoomCallSession => {
  const client = useMatrixClient();
  const overlay = useCallOverlay();
  const [view, setView] = useState<MembershipView>(NO_CALL);

  useEffect(() => {
    if (!client || !matrixRoomId) {
      setView(NO_CALL);
      return;
    }
    let session: SessionLike | undefined;
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;

    const evaluate = (): void => {
      clearTimeout(expiryTimer);
      expiryTimer = undefined;
      const next = sessionOf(client, matrixRoomId);
      if (next !== session) {
        session?.off(MEMBERSHIPS_CHANGED, evaluate);
        next?.on(MEMBERSHIPS_CHANGED, evaluate);
        session = next;
      }
      const live = liveMemberships(session);
      const summary = summarize(live, client.getUserId(), client.getDeviceId());
      setView(previous => (sameView(previous, summary) ? previous : summary));
      const untilExpiry = nextExpiryMs(live);
      if (untilExpiry !== undefined) {
        expiryTimer = setTimeout(evaluate, untilExpiry);
      }
    };

    evaluate();
    const rtc = rtcOf(client);
    rtc.on(SESSION_STARTED, evaluate);
    rtc.on(SESSION_ENDED, evaluate);
    // The room itself may arrive with a later sync.
    client.on(CLIENT_ROOM as never, evaluate as never);
    return () => {
      clearTimeout(expiryTimer);
      session?.off(MEMBERSHIPS_CHANGED, evaluate);
      rtc.off(SESSION_STARTED, evaluate);
      rtc.off(SESSION_ENDED, evaluate);
      client.removeListener(CLIENT_ROOM as never, evaluate as never);
    };
  }, [client, matrixRoomId]);

  const hostedHere = matrixRoomId !== null && overlay?.matrixRoomId === matrixRoomId;
  return { ...view, isJoinedHere: hostedHere && view.isJoinedOnThisDevice };
};

export { useRoomCallSession };
export type { RoomCallSession };
