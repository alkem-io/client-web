import type { MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';
import type { RawEvent } from './matrixEvents';
import { serverNameOf } from './matrixEvents';

// matrix-js-sdk enum values, as strings so the SDK stays a lazily loaded chunk.
const ROOM_TIMELINE = 'Room.timeline';
const ROOM_REDACTION = 'Room.redaction';
const ROOM_ACCOUNT_DATA = 'Room.accountData';
const ROOM_LOCAL_ECHO_UPDATED = 'Room.localEchoUpdated';
const ROOM_TAGS = 'Room.tags';
const CLIENT_ROOM = 'Room';
const CLIENT_SYNC = 'sync';
const DIRECTION_BACKWARD = 'b';
const NOTIFICATION_TOTAL = 'total';
const FULLY_READ = 'm.fully_read';
// A pin is the user's own favourite tag on the room, so every client of the
// account sees it; other members of the room do not.
const FAVOURITE_TAG = 'm.favourite';

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

const isFavourite = (room: Room): boolean => FAVOURITE_TAG in room.tags;

/** Rejects when the conversation's Matrix room is not known to the client yet. */
const setFavourite = async (client: MatrixClient, alkemioRoomId: string, favourite: boolean): Promise<void> => {
  const roomId = await resolveMatrixRoomId(client, alkemioRoomId);
  if (!roomId || !client.getRoom(roomId)) {
    throw new Error(`No Matrix room for conversation room ${alkemioRoomId}`);
  }
  await (favourite ? client.setRoomTag(roomId, FAVOURITE_TAG) : client.deleteRoomTag(roomId, FAVOURITE_TAG));
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
  ROOM_TAGS,
  ROOM_TIMELINE,
  fetchBackward,
  fullyReadEventId,
  homeserverOf,
  isFavourite,
  liveEvents,
  notificationCount,
  ownUserId,
  resolveMatrixRoomId,
  setFavourite,
  toRawEvent,
};
