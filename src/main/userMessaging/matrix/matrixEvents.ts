import { mapMatrixMessageAttachments } from '../models';

/**
 * Pure projections of raw Matrix events into conversation messages, following
 * the same rules matrix-adapter applies when it serves conversation history,
 * so the browser renders what the GraphQL path rendered.
 */

const EVENT_MESSAGE = 'm.room.message';
const EVENT_STICKER = 'm.sticker';
const EVENT_REACTION = 'm.reaction';
// The call UI sends this once when a call starts: kind `ring` for a 1:1 call, `notification` for a group call.
const EVENT_CALL_NOTIFICATION = 'org.matrix.msc4075.rtc.notification';
// One per device in a call; empty content once the device has left.
const EVENT_CALL_MEMBER = 'org.matrix.msc3401.call.member';
// The call SDK's own default and cap for how long a ring rings.
const DEFAULT_RING_LIFETIME_MS = 30_000;
const MAX_RING_LIFETIME_MS = 90_000;
const MEDIA_MSGTYPES = new Set(['m.image', 'm.file', 'm.video', 'm.audio']);

type RawEvent = {
  readonly eventId: string;
  readonly type: string;
  readonly sender: string;
  readonly timestamp: number;
  readonly content: Record<string, unknown>;
};

/** A media reference as the event carries it; resolved to an attachment elsewhere. */
type MediaRef = {
  /** Present only for media hosted on this homeserver. */
  readonly externalReference?: string;
  readonly displayName: string;
  readonly mimeType?: string;
  readonly size?: number;
  readonly width?: number;
  readonly height?: number;
};

type ParsedReaction = {
  readonly eventId: string;
  readonly emoji: string;
  readonly timestamp: number;
  readonly sender: string;
};

/** What became of a 1:1 ring, as far as the room's events tell. */
type CallOutcome = 'answered' | 'unanswered' | 'ringing';

type ParsedMessage = {
  readonly eventId: string;
  readonly body: string;
  readonly timestamp: number;
  readonly sender: string;
  readonly media?: MediaRef;
  readonly reactions: ParsedReaction[];
  /** Set only on the entry a 1:1 ring makes in the timeline. */
  readonly call?: CallOutcome;
};

const isMessageLike = (type: string): boolean => type === EVENT_MESSAGE || type === EVENT_STICKER;

const isRing = (event: Pick<RawEvent, 'type' | 'content'>): boolean =>
  event.type === EVENT_CALL_NOTIFICATION && event.content.notification_type === 'ring';

/** What the thread, the list preview, the read marker and the unread count all treat as an entry. */
const isTimelineEntry = (event: Pick<RawEvent, 'type' | 'content'>): boolean =>
  isMessageLike(event.type) || isRing(event);

const ringEndOf = (ring: RawEvent): number => {
  const { lifetime } = ring.content;
  const ms =
    typeof lifetime === 'number' && lifetime > 0 ? Math.min(lifetime, MAX_RING_LIFETIME_MS) : DEFAULT_RING_LIFETIME_MS;
  return ring.timestamp + ms;
};

const isCallJoin = (event: RawEvent): boolean =>
  event.type === EVENT_CALL_MEMBER && Object.keys(event.content).length > 0;

/** Whether someone other than the ringer joined the call while it rang; `newer` holds events after the ring. */
const isAnswered = (ring: RawEvent, newer: Iterable<RawEvent>): boolean => {
  const end = ringEndOf(ring);
  for (const event of newer) {
    if (event.sender !== ring.sender && isCallJoin(event) && event.timestamp <= end) {
      return true;
    }
  }
  return false;
};

/**
 * The outcome of the ring at `events[index]` (oldest first): answered once the
 * other person joins while it rings; unanswered once the ringer has left or the
 * ring's lifetime has passed; ringing until then. A later join does not answer it.
 */
const callOutcomeOf = (events: readonly RawEvent[], index: number, now: number): CallOutcome => {
  const ring = events[index];
  const newer = events.slice(index + 1);
  if (isAnswered(ring, newer)) {
    return 'answered';
  }
  const ringerLeft = newer.some(
    event => event.type === EVENT_CALL_MEMBER && event.sender === ring.sender && !isCallJoin(event)
  );
  return ringerLeft || now >= ringEndOf(ring) ? 'unanswered' : 'ringing';
};

const serverNameOf = (userId: string): string => userId.slice(userId.indexOf(':') + 1);

/** The Alkemio actor id is the Matrix localpart. */
const actorIdOf = (userId: string): string => userId.slice(1, userId.indexOf(':'));

// Event metadata is written by room members; retain only usable dimensions.
const MAX_INT = 2_147_483_647;

const positiveInt = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= MAX_INT ? value : undefined;

const extractMedia = (event: RawEvent, homeserver: string): MediaRef | undefined => {
  const { content } = event;
  if (event.type !== EVENT_STICKER && !MEDIA_MSGTYPES.has(content.msgtype as string)) {
    return undefined;
  }
  const [attachment] = mapMatrixMessageAttachments(content, homeserver, undefined, event.type);
  if (!attachment?.id) {
    return undefined;
  }
  return {
    externalReference: attachment.id,
    displayName: attachment.displayName,
    mimeType: attachment.mimeType,
    size: positiveInt(attachment.size),
    width: positiveInt(attachment.width),
    height: positiveInt(attachment.height),
  };
};

/**
 * Message-like events become messages carrying their body verbatim; blank ones
 * (no body, no attachment — e.g. redacted) are skipped, and reactions attach to
 * the message they annotate. A 1:1 ring becomes a call entry at its time.
 */
const projectMessages = (events: RawEvent[], homeserver: string, now = Date.now()): ParsedMessage[] => {
  const messages: ParsedMessage[] = [];
  const byId = new Map<string, ParsedMessage>();

  for (let index = 0; index < events.length; index++) {
    const event = events[index];
    if (isRing(event)) {
      messages.push(parseRing(events, index, now));
      continue;
    }
    if (!isMessageLike(event.type)) {
      continue;
    }
    const message = parseMessage(event, homeserver);
    if (message) {
      messages.push(message);
      byId.set(message.eventId, message);
    }
  }

  for (const event of events) {
    if (event.type !== EVENT_REACTION) {
      continue;
    }
    const relation = (event.content['m.relates_to'] ?? {}) as Record<string, unknown>;
    const parent = typeof relation.event_id === 'string' ? byId.get(relation.event_id) : undefined;
    if (parent) {
      parent.reactions.push({
        eventId: event.eventId,
        emoji: typeof relation.key === 'string' ? relation.key : '',
        timestamp: event.timestamp,
        sender: event.sender,
      });
    }
  }

  return messages;
};

const parseMessage = (event: RawEvent, homeserver: string): ParsedMessage | undefined => {
  const media = extractMedia(event, homeserver);
  // A sticker's body is alt-text for its image, never message text.
  const isSticker = event.type === EVENT_STICKER;
  const body = !isSticker && typeof event.content.body === 'string' ? event.content.body : '';
  if (body === '' && !media) {
    return undefined;
  }
  return { eventId: event.eventId, body, timestamp: event.timestamp, sender: event.sender, media, reactions: [] };
};

const parseRing = (events: readonly RawEvent[], index: number, now: number): ParsedMessage => {
  const { eventId, timestamp, sender } = events[index];
  return { eventId, body: '', timestamp, sender, reactions: [], call: callOutcomeOf(events, index, now) };
};

/** The newest non-blank message or call entry among `events` (oldest first), if any. */
const lastMessageOf = (events: RawEvent[], homeserver: string, now = Date.now()): ParsedMessage | undefined => {
  for (let index = events.length - 1; index >= 0; index--) {
    const event = events[index];
    if (isRing(event)) {
      return parseRing(events, index, now);
    }
    if (isMessageLike(event.type)) {
      const message = parseMessage(event, homeserver);
      if (message) {
        return message;
      }
    }
  }
  return undefined;
};

/**
 * The newest entry among `events` (oldest first), rendered or not: the read
 * marker must reach every event the unread count would count.
 */
const newestMessageLikeId = (events: RawEvent[]): string | null => {
  for (let index = events.length - 1; index >= 0; index--) {
    if (isTimelineEntry(events[index])) {
      return events[index].eventId;
    }
  }
  return null;
};

export {
  actorIdOf,
  isAnswered,
  isMessageLike,
  isRing,
  lastMessageOf,
  newestMessageLikeId,
  projectMessages,
  serverNameOf,
  EVENT_MESSAGE,
  EVENT_REACTION,
  EVENT_STICKER,
};
export type { CallOutcome, MediaRef, ParsedMessage, ParsedReaction, RawEvent };
