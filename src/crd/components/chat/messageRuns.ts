import { isSameDay } from 'date-fns';
import type { ChatMessage } from './types';

/** Consecutive messages from one sender at most this far apart form one group. */
const GROUP_GAP_MS = 5 * 60 * 1000;
/** A same-day gap at least this long gets a time marker where the conversation continues. */
const PAUSE_MS = 60 * 60 * 1000;

/** Where a bubble sits in its group — decides which corners meet a neighbour. */
export type GroupPosition = 'single' | 'first' | 'middle' | 'last';

export type MessageRunFlags = {
  /** First message of a group in a group thread — show the name (+ VC badge). */
  showAuthor: boolean;
  /** First message of a group in a group thread — show the sender's avatar. */
  showAvatar: boolean;
  /** Reserve the left avatar gutter (own messages, 1:1, Guidance never do). */
  avatarGutter: boolean;
  groupPosition: GroupPosition;
  /** First message of a calendar day — gets the day separator with its start time. */
  dayStart: boolean;
  /** Same day, at least an hour after the previous message — gets a time marker. */
  afterPause: boolean;
};

type RunInput = Pick<ChatMessage, 'isOwn' | 'author' | 'timestampMs'>;

const senderKey = (message: RunInput) => (message.isOwn ? 'own' : message.author?.id);

/**
 * Groups a thread the way messaging apps do: consecutive messages from the same
 * sender, each within 5 minutes of the previous one and on the same day, form
 * one group. The first message of a group shows the avatar and name (group
 * threads only). Own messages, 1:1 threads and Guidance never show either.
 * Authorless (system) messages always stand alone. A message without a time
 * (`timestampMs` 0, the synthetic Guidance intro) starts neither a day nor a pause.
 */
export function computeMessageRunFlags(messages: readonly RunInput[], isGroup: boolean): MessageRunFlags[] {
  const starts = messages.map((message, index) => {
    const previous = index > 0 ? messages[index - 1] : undefined;
    const hasTime = message.timestampMs > 0;
    const previousHasTime = Boolean(previous && previous.timestampMs > 0);
    const dayStart =
      hasTime && (!previous || !previousHasTime || !isSameDay(previous.timestampMs, message.timestampMs));
    const gap = previous && previousHasTime ? message.timestampMs - previous.timestampMs : Number.POSITIVE_INFINITY;
    const afterPause = hasTime && !dayStart && gap >= PAUSE_MS;
    const sameSender = Boolean(previous?.author && message.author && senderKey(previous) === senderKey(message));
    const firstOfGroup = !sameSender || dayStart || !hasTime || gap > GROUP_GAP_MS;
    return { dayStart, afterPause, firstOfGroup };
  });

  return messages.map((message, index) => {
    const { dayStart, afterPause, firstOfGroup } = starts[index];
    const lastOfGroup = index === messages.length - 1 || starts[index + 1].firstOfGroup;
    const groupPosition: GroupPosition =
      firstOfGroup && lastOfGroup ? 'single' : firstOfGroup ? 'first' : lastOfGroup ? 'last' : 'middle';
    const showIdentity = isGroup && !message.isOwn && Boolean(message.author) && firstOfGroup;
    return {
      showAuthor: showIdentity,
      showAvatar: showIdentity,
      avatarGutter: isGroup && !message.isOwn,
      groupPosition,
      dayStart,
      afterPause,
    };
  });
}
