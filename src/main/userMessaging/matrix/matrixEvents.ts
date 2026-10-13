import { mapMatrixMessageAttachments } from '../models';

/**
 * Pure projections of raw Matrix events into conversation messages, following
 * the same rules matrix-adapter applies when it serves conversation history,
 * so the browser renders what the GraphQL path rendered.
 */

const EVENT_MESSAGE = 'm.room.message';
const EVENT_STICKER = 'm.sticker';
const EVENT_REACTION = 'm.reaction';
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

type ParsedMessage = {
  readonly eventId: string;
  readonly body: string;
  readonly timestamp: number;
  readonly sender: string;
  readonly media?: MediaRef;
  readonly reactions: ParsedReaction[];
};

const isMessageLike = (type: string): boolean => type === EVENT_MESSAGE || type === EVENT_STICKER;

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
 * the message they annotate.
 */
const projectMessages = (events: RawEvent[], homeserver: string): ParsedMessage[] => {
  const messages: ParsedMessage[] = [];
  const byId = new Map<string, ParsedMessage>();

  for (const event of events) {
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

/** The newest non-blank message among `events` (oldest first), if any. */
const lastMessageOf = (events: RawEvent[], homeserver: string): ParsedMessage | undefined => {
  for (let index = events.length - 1; index >= 0; index--) {
    const event = events[index];
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
 * The newest message-like event among `events` (oldest first), rendered or
 * not: the read marker must reach every event the unread count would count.
 */
const newestMessageLikeId = (events: RawEvent[]): string | null => {
  for (let index = events.length - 1; index >= 0; index--) {
    if (isMessageLike(events[index].type)) {
      return events[index].eventId;
    }
  }
  return null;
};

export {
  actorIdOf,
  isMessageLike,
  lastMessageOf,
  newestMessageLikeId,
  projectMessages,
  serverNameOf,
  EVENT_MESSAGE,
  EVENT_REACTION,
  EVENT_STICKER,
};
export type { MediaRef, ParsedMessage, ParsedReaction, RawEvent };
