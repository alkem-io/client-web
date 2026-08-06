import type { ChatMessage } from './types';

export type MessageRunFlags = {
  /** First message of a consecutive-sender run — show the name (+ VC badge). */
  showAuthor: boolean;
  /** First message of a consecutive-sender run — show the sender's avatar. */
  showAvatar: boolean;
  /** Reserve the left avatar gutter (own messages, 1:1, Guidance never do). */
  avatarGutter: boolean;
};

/**
 * Computes messaging-app-style run-grouping flags for a group thread's incoming
 * messages: the first message of a consecutive-sender run shows the avatar
 * and name, later messages in the run are indented under it. Own messages,
 * authorless (system) messages, and non-group threads never carry an avatar
 * or name, and an authorless message always breaks a run. Time is never
 * consulted (FR-013) — pure function of sender identity + rendered order.
 */
export function computeMessageRunFlags(
  messages: readonly Pick<ChatMessage, 'isOwn' | 'author'>[],
  isGroup: boolean
): MessageRunFlags[] {
  if (!isGroup) {
    return messages.map(() => ({ showAuthor: false, showAvatar: false, avatarGutter: false }));
  }

  return messages.map((message, index) => {
    if (message.isOwn || !message.author) {
      return { showAuthor: false, showAvatar: false, avatarGutter: !message.isOwn };
    }

    const previous = index > 0 ? messages[index - 1] : undefined;
    const isFirstOfRun = !previous || previous.isOwn || !previous.author || previous.author.id !== message.author.id;

    return { showAuthor: isFirstOfRun, showAvatar: isFirstOfRun, avatarGutter: true };
  });
}
