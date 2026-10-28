import type { MatrixClient } from 'matrix-js-sdk';
import { CLIENT_ROOM } from '@/main/userMessaging/matrix/matrixRooms';

// matrix-js-sdk MatrixRTC event names, as strings so the SDK stays a lazily loaded chunk.
const SESSION_STARTED = 'session_started';
const SESSION_ENDED = 'session_ended';
const MEMBERSHIPS_CHANGED = 'memberships_changed';

type MembershipLike = {
  readonly sender?: string;
  readonly deviceId: string;
  isExpired(): boolean;
  getMsUntilExpiry(): number | undefined;
};

type RtcEmitter = {
  on(event: string, listener: () => void): unknown;
  off(event: string, listener: () => void): unknown;
};

type SessionLike = RtcEmitter & {
  readonly memberships: MembershipLike[];
};

/** The chat SDK's call session for a Matrix room, once the room is known to the client. */
const sessionOf = (client: MatrixClient, matrixRoomId: string): SessionLike | undefined => {
  const room = client.getRoom(matrixRoomId);
  return room ? (client.matrixRTC.getRoomSession(room) as unknown as SessionLike) : undefined;
};

const rtcOf = (client: MatrixClient): RtcEmitter => client.matrixRTC as unknown as RtcEmitter;

/** Memberships that still count: a device that vanished without leaving drops out when its membership expires. */
const liveMemberships = (session: SessionLike | undefined): MembershipLike[] =>
  (session?.memberships ?? []).filter(membership => !membership.isExpired());

/** Milliseconds until the nearest of these memberships expires, if any will. */
const nextExpiryMs = (memberships: MembershipLike[]): number | undefined => {
  const pending = memberships
    .map(membership => membership.getMsUntilExpiry())
    .filter((ms): ms is number => ms !== undefined && ms > 0);
  return pending.length > 0 ? Math.min(...pending) : undefined;
};

/**
 * Reports the unexpired call memberships of each of the rooms now, and again
 * whenever they change: a call session starts or ends, its memberships change,
 * a room arrives with a later sync, or the nearest membership expires (a
 * participant whose device vanished drops out without waiting for a sync).
 * Returns the unsubscribe.
 */
const watchLiveMemberships = (
  client: MatrixClient,
  matrixRoomIds: readonly string[],
  onChange: (live: ReadonlyMap<string, MembershipLike[]>) => void
): (() => void) => {
  const sessions = new Map<string, SessionLike>();
  let expiryTimer: ReturnType<typeof setTimeout> | undefined;

  const evaluate = (): void => {
    clearTimeout(expiryTimer);
    expiryTimer = undefined;
    const live = new Map<string, MembershipLike[]>();
    let untilExpiry: number | undefined;
    for (const matrixRoomId of matrixRoomIds) {
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
      const roomLive = liveMemberships(session);
      live.set(matrixRoomId, roomLive);
      const roomExpiry = nextExpiryMs(roomLive);
      if (roomExpiry !== undefined) {
        untilExpiry = untilExpiry === undefined ? roomExpiry : Math.min(untilExpiry, roomExpiry);
      }
    }
    onChange(live);
    if (untilExpiry !== undefined) {
      expiryTimer = setTimeout(evaluate, untilExpiry);
    }
  };

  evaluate();
  const rtc = rtcOf(client);
  rtc.on(SESSION_STARTED, evaluate);
  rtc.on(SESSION_ENDED, evaluate);
  client.on(CLIENT_ROOM as never, evaluate as never);
  return () => {
    clearTimeout(expiryTimer);
    for (const session of sessions.values()) {
      session.off(MEMBERSHIPS_CHANGED, evaluate);
    }
    rtc.off(SESSION_STARTED, evaluate);
    rtc.off(SESSION_ENDED, evaluate);
    client.removeListener(CLIENT_ROOM as never, evaluate as never);
  };
};

export { watchLiveMemberships };
export type { MembershipLike };
