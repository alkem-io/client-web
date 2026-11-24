import { mapMatrixMessageAttachments } from '../models';

/**
 * Pure projections of raw Matrix events into conversation messages, following
 * the same rules matrix-adapter applies when it serves conversation history,
 * so the browser renders what the GraphQL path rendered.
 */

const EVENT_MESSAGE = 'm.room.message';
const EVENT_STICKER = 'm.sticker';
const EVENT_REACTION = 'm.reaction';
// Sent once by whoever starts a call; only a 1:1 call rings (`ring`), a group call notifies.
const EVENT_RTC_NOTIFICATION = 'org.matrix.msc4075.rtc.notification';
const EVENT_CALL_NOTIFY = 'org.matrix.msc4075.call.notify';
// One per device in a call: the older state event is empty once the device left, the newer one says so.
const EVENT_CALL_MEMBER = 'org.matrix.msc3401.call.member';
const EVENT_RTC_MEMBER = 'org.matrix.msc4143.rtc.member';
// The person rung turns the call down; it references the ring.
const EVENT_RTC_DECLINE = 'org.matrix.msc4310.rtc.decline';
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

/** What became of a 1:1 ring, as far as the loaded events tell. */
type CallOutcome = 'ringing' | 'unanswered' | 'declined' | 'answered';

type ParsedCall = {
  readonly outcome: CallOutcome;
  /** An answered call's length, when the leave that ended it is loaded. */
  readonly durationMs?: number;
};

type ParsedMessage = {
  readonly eventId: string;
  readonly body: string;
  readonly timestamp: number;
  readonly sender: string;
  readonly media?: MediaRef;
  readonly reactions: ParsedReaction[];
  /** Set only on the entry a 1:1 ring makes in the timeline, once it has stopped ringing. */
  readonly call?: ParsedCall;
};

/**
 * Calls are a beta: where call controls do not show (`withCalls` off), a ring
 * is no entry either, so a call the user never heard ring is never missed.
 */
type EntryOptions = {
  readonly withCalls?: boolean;
  /** The time a ring's outcome is judged at. */
  readonly now?: number;
};

const isMessageLike = (type: string): boolean => type === EVENT_MESSAGE || type === EVENT_STICKER;

const isRing = (event: RawEvent): boolean =>
  (event.type === EVENT_RTC_NOTIFICATION && event.content.notification_type === 'ring') ||
  (event.type === EVENT_CALL_NOTIFY && event.content.notify_type === 'ring');

const callMembershipOf = (event: RawEvent): 'join' | 'leave' | undefined => {
  if (event.type === EVENT_CALL_MEMBER) {
    return Object.keys(event.content).length > 0 ? 'join' : 'leave';
  }
  if (event.type === EVENT_RTC_MEMBER) {
    const membership = (event.content.member as Record<string, unknown> | undefined)?.membership;
    return membership === 'join' || membership === 'leave' ? membership : undefined;
  }
  return undefined;
};

const ringEndOf = (ring: RawEvent): number => {
  const { lifetime } = ring.content;
  const ms =
    typeof lifetime === 'number' && lifetime > 0 ? Math.min(lifetime, MAX_RING_LIFETIME_MS) : DEFAULT_RING_LIFETIME_MS;
  return ring.timestamp + ms;
};

const isDeclineOf = (event: RawEvent, ring: RawEvent): boolean =>
  event.type === EVENT_RTC_DECLINE &&
  event.sender !== ring.sender &&
  (event.content['m.relates_to'] as Record<string, unknown> | undefined)?.event_id === ring.eventId;

/**
 * What became of `ring`, judged by the events after it (oldest first): answered
 * once someone else joins before the ringer leaves, even after the ring stopped,
 * lasting until either of the two leaves; declined when the person rung turns it
 * down; unanswered once the ringer has left or the ring's lifetime has passed;
 * ringing until then.
 */
const callOf = (ring: RawEvent, newer: readonly RawEvent[], now: number): ParsedCall => {
  const end = ringEndOf(ring);
  let answer: RawEvent | undefined;
  let declined = false;
  let ringerLeft = false;
  for (const event of newer) {
    const membership = callMembershipOf(event);
    if (answer) {
      if (membership === 'leave' && (event.sender === ring.sender || event.sender === answer.sender)) {
        return { outcome: 'answered', durationMs: event.timestamp - answer.timestamp };
      }
    } else if (membership === 'join' && event.sender !== ring.sender && !declined && !ringerLeft) {
      answer = event;
    } else if (membership === 'leave' && event.sender === ring.sender) {
      ringerLeft = true;
    } else if (isDeclineOf(event, ring)) {
      declined = true;
    }
  }
  if (answer) {
    return { outcome: 'answered' };
  }
  if (declined) {
    return { outcome: 'declined' };
  }
  return { outcome: ringerLeft || now >= end ? 'unanswered' : 'ringing' };
};

/** A ring still ringing is no entry yet: what becomes of it is not known until it stops. */
const parseRing = (ring: RawEvent, newer: readonly RawEvent[], now: number): ParsedMessage | undefined => {
  const call = callOf(ring, newer, now);
  if (call.outcome === 'ringing') {
    return undefined;
  }
  return { eventId: ring.eventId, body: '', timestamp: ring.timestamp, sender: ring.sender, reactions: [], call };
};

/**
 * When the soonest of the rings among `events` (oldest first) that still ring
 * stops ringing, if any does: it becomes an entry then.
 */
const ringingUntil = (events: readonly RawEvent[], now: number): number | undefined => {
  let until: number | undefined;
  for (const [index, event] of events.entries()) {
    if (isRing(event) && ringEndOf(event) > now && callOf(event, events.slice(index + 1), now).outcome === 'ringing') {
      until = Math.min(until ?? ringEndOf(event), ringEndOf(event));
    }
  }
  return until;
};

/** The newest ring among `events` (oldest first) from someone other than `ownUserId` that still rings, if any. */
const ringingRingId = (events: readonly RawEvent[], ownUserId: string, now: number): string | undefined => {
  for (let index = events.length - 1; index >= 0; index--) {
    const event = events[index];
    if (
      isRing(event) &&
      event.sender !== ownUserId &&
      callOf(event, events.slice(index + 1), now).outcome === 'ringing'
    ) {
      return event.eventId;
    }
  }
  return undefined;
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
const projectMessages = (
  events: RawEvent[],
  homeserver: string,
  { withCalls = false, now = Date.now() }: EntryOptions = {}
): ParsedMessage[] => {
  const messages: ParsedMessage[] = [];
  const byId = new Map<string, ParsedMessage>();

  for (const [index, event] of events.entries()) {
    if (withCalls && isRing(event)) {
      const call = parseRing(event, events.slice(index + 1), now);
      if (call) {
        messages.push(call);
      }
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

/** The newest non-blank message or call entry among `events` (oldest first), if any. */
const lastMessageOf = (
  events: RawEvent[],
  homeserver: string,
  { withCalls = false, now = Date.now() }: EntryOptions = {}
): ParsedMessage | undefined => {
  for (let index = events.length - 1; index >= 0; index--) {
    const event = events[index];
    if (withCalls && isRing(event)) {
      const call = parseRing(event, events.slice(index + 1), now);
      if (call) {
        return call;
      }
    } else if (isMessageLike(event.type)) {
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
const newestEntryId = (
  events: RawEvent[],
  { withCalls = false, now = Date.now() }: EntryOptions = {}
): string | null => {
  for (let index = events.length - 1; index >= 0; index--) {
    const event = events[index];
    if (
      isMessageLike(event.type) ||
      (withCalls && isRing(event) && callOf(event, events.slice(index + 1), now).outcome !== 'ringing')
    ) {
      return event.eventId;
    }
  }
  return null;
};

export {
  actorIdOf,
  callOf,
  isMessageLike,
  isRing,
  lastMessageOf,
  newestEntryId,
  projectMessages,
  ringingRingId,
  ringingUntil,
  serverNameOf,
  EVENT_MESSAGE,
  EVENT_REACTION,
  EVENT_STICKER,
};
export type { MediaRef, ParsedCall, ParsedMessage, ParsedReaction, RawEvent };
