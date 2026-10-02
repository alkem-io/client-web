/**
 * Pure projections of raw Matrix events into conversation messages, following
 * the same rules matrix-adapter applies when it serves conversation history,
 * so the browser renders what the GraphQL path rendered.
 */

const EVENT_MESSAGE = 'm.room.message';
const EVENT_STICKER = 'm.sticker';
const EVENT_REACTION = 'm.reaction';
const MEDIA_MSGTYPES = new Set(['m.image', 'm.file', 'm.video', 'm.audio']);
const DOCUMENT_ID_KEY = 'io.alkemio.document_id';

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
  readonly mediaID?: string;
  readonly documentID?: string;
  readonly displayName: string;
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

/** `mxc://<server>/<id>` → `<id>`, only when `<server>` is this homeserver. */
const localMediaId = (url: unknown, homeserver: string): string | undefined => {
  if (typeof url !== 'string' || !url.startsWith('mxc://')) {
    return undefined;
  }
  const rest = url.slice('mxc://'.length);
  const slash = rest.indexOf('/');
  if (slash <= 0) {
    return undefined;
  }
  const server = rest.slice(0, slash);
  const id = rest.slice(slash + 1);
  return server === homeserver && id !== '' && !id.includes('/') ? id : undefined;
};

// Event content is written by any room member; values the server's input
// types would reject are dropped here so one bad event cannot fail a batch.
const MAX_INT = 2_147_483_647;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const positiveInt = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= MAX_INT ? value : undefined;

// A string `filename` declares the event caption-shaped, making `body` a
// caption; only without one is `body` the filename.
const mediaDisplayName = (content: Record<string, unknown>): string => {
  if (typeof content.filename === 'string') {
    return content.filename;
  }
  return typeof content.body === 'string' ? content.body : '';
};

const extractMedia = (event: RawEvent, homeserver: string): MediaRef | undefined => {
  const { content } = event;
  if (event.type !== EVENT_STICKER && !MEDIA_MSGTYPES.has(content.msgtype as string)) {
    return undefined;
  }
  const mediaID = localMediaId(content.url, homeserver);
  const documentID =
    typeof content[DOCUMENT_ID_KEY] === 'string' && UUID.test(content[DOCUMENT_ID_KEY] as string)
      ? (content[DOCUMENT_ID_KEY] as string)
      : undefined;
  if (!mediaID && !documentID) {
    return undefined;
  }
  const info = (content.info ?? {}) as Record<string, unknown>;
  return {
    mediaID,
    documentID,
    displayName: mediaDisplayName(content),
    width: positiveInt(info.w),
    height: positiveInt(info.h),
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

export {
  actorIdOf,
  isMessageLike,
  lastMessageOf,
  localMediaId,
  projectMessages,
  serverNameOf,
  EVENT_MESSAGE,
  EVENT_REACTION,
  EVENT_STICKER,
};
export type { MediaRef, ParsedMessage, ParsedReaction, RawEvent };
