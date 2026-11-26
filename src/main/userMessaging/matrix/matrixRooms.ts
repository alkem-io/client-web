import type { MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';
import type { RawEvent } from './matrixEvents';
import { serverNameOf } from './matrixEvents';

// matrix-js-sdk enum values, as strings so the SDK stays a lazily loaded chunk.
const ROOM_TIMELINE = 'Room.timeline';
const ROOM_REDACTION = 'Room.redaction';
const ROOM_ACCOUNT_DATA = 'Room.accountData';
const ROOM_LOCAL_ECHO_UPDATED = 'Room.localEchoUpdated';
const CLIENT_ROOM = 'Room';
const CLIENT_SYNC = 'sync';
const DIRECTION_BACKWARD = 'b';
const NOTIFICATION_TOTAL = 'total';
const FULLY_READ = 'm.fully_read';

const toRawEvent = (event: MatrixEvent): RawEvent => ({
  eventId: event.getId() ?? '',
  type: event.getType(),
  sender: event.getSender() ?? '',
  timestamp: event.getTs(),
  content: event.getOriginalContent() as Record<string, unknown>,
});

// The SDK puts our own unsent events (local echoes) into the live timeline
// under a temporary id; only events the server has accepted are rendered.
const liveEvents = (room: Room): RawEvent[] =>
  room
    .getLiveTimeline()
    .getEvents()
    .filter(event => !event.status)
    .map(toRawEvent);

const ownUserId = (client: MatrixClient): string => client.getUserId() ?? '';

const homeserverOf = (client: MatrixClient): string => serverNameOf(ownUserId(client));

const nativeId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const nilId = '00000000-0000-0000-0000-000000000000';

const nativeMatrixId = (id: string, sigil: '@' | '!', client: MatrixClient): string | undefined => {
  const server = homeserverOf(client);
  return server && nativeId.test(id) && id !== nilId ? `${sigil}${id}:${server}` : undefined;
};

const nativeEntityId = (matrixId: string, sigil: '@' | '!', client: MatrixClient): string | undefined => {
  const id = matrixId.slice(1, 37);
  return nativeMatrixId(id, sigil, client) === matrixId ? id : undefined;
};

const fullyReadEventId = (room: Room): string | undefined => {
  const eventId = room.getAccountData(FULLY_READ)?.getContent()?.event_id;
  return typeof eventId === 'string' ? eventId : undefined;
};

const fetchBackward =
  (client: MatrixClient, roomId: string) =>
  async (from: string | undefined, limit: number): Promise<{ events: RawEvent[]; end?: string }> => {
    const response = await client.createMessagesRequest(
      roomId,
      from ?? null,
      limit,
      DIRECTION_BACKWARD as Parameters<MatrixClient['createMessagesRequest']>[3]
    );
    return {
      events: response.chunk.map(event => ({
        eventId: event.event_id,
        type: event.type,
        sender: event.sender,
        timestamp: event.origin_server_ts,
        content: event.content as Record<string, unknown>,
      })),
      end: response.end,
    };
  };

const notificationCount = (room: Room): number =>
  room.getUnreadNotificationCount(NOTIFICATION_TOTAL as Parameters<Room['getUnreadNotificationCount']>[0]) ?? 0;

export {
  CLIENT_ROOM,
  CLIENT_SYNC,
  FULLY_READ,
  ROOM_ACCOUNT_DATA,
  ROOM_LOCAL_ECHO_UPDATED,
  ROOM_REDACTION,
  ROOM_TIMELINE,
  fetchBackward,
  fullyReadEventId,
  homeserverOf,
  liveEvents,
  nativeEntityId,
  nativeMatrixId,
  notificationCount,
  ownUserId,
  toRawEvent,
};
