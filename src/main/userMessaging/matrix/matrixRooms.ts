import type { MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';
import type { RawEvent } from './matrixEvents';
import { serverNameOf } from './matrixEvents';

// matrix-js-sdk enum values, as strings so the SDK stays a lazily loaded chunk.
const ROOM_TIMELINE = 'Room.timeline';
const ROOM_REDACTION = 'Room.redaction';
const ROOM_ACCOUNT_DATA = 'Room.accountData';
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

const liveEvents = (room: Room): RawEvent[] => room.getLiveTimeline().getEvents().map(toRawEvent);

const ownUserId = (client: MatrixClient): string => client.getUserId() ?? '';

const homeserverOf = (client: MatrixClient): string => serverNameOf(ownUserId(client));

// Conversation rooms are reachable only through the alias matrix-adapter
// creates for them; the directory lookup is remembered for the client's life.
const resolvedRoomIds = new WeakMap<MatrixClient, Map<string, Promise<string | null>>>();

const resolveMatrixRoomId = (client: MatrixClient, alkemioRoomId: string): Promise<string | null> => {
  let perClient = resolvedRoomIds.get(client);
  if (!perClient) {
    perClient = new Map();
    resolvedRoomIds.set(client, perClient);
  }
  const known = perClient.get(alkemioRoomId);
  if (known) {
    return known;
  }
  const lookup = client
    .getRoomIdForAlias(`#${alkemioRoomId}:${homeserverOf(client)}`)
    .then(response => response.room_id)
    .catch(() => {
      // Not remembered: a later watch can try again.
      perClient.delete(alkemioRoomId);
      return null;
    });
  perClient.set(alkemioRoomId, lookup);
  return lookup;
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
  ROOM_REDACTION,
  ROOM_TIMELINE,
  fetchBackward,
  fullyReadEventId,
  homeserverOf,
  liveEvents,
  notificationCount,
  ownUserId,
  resolveMatrixRoomId,
  toRawEvent,
};
