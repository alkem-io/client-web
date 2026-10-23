import type { MatrixClient } from 'matrix-js-sdk';

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

export { liveMemberships, MEMBERSHIPS_CHANGED, nextExpiryMs, rtcOf, SESSION_ENDED, SESSION_STARTED, sessionOf };
export type { MembershipLike, SessionLike };
