export type ShouldPlayChatSoundInput = {
  /** The message was sent by the current user (from another device/tab). */
  isOwnMessage: boolean;
  /** The message's conversation is the one currently selected in this tab. */
  isViewing: boolean;
  /** The browser tab is focused (`document.hasFocus()`). */
  hasFocus: boolean;
  /** The chat-sound preference is on. */
  enabled: boolean;
};

/**
 * Pure predicate deciding whether the chat sound plays for a received message.
 *
 * Plays when the sound is enabled, the message is not the user's own, and the
 * conversation is not both selected and focused. The `isViewing && hasFocus`
 * suppression is sound-only (FR-010): read/unread state stays selection-based
 * and focus-independent.
 */
export const shouldPlayChatSound = ({
  isOwnMessage,
  isViewing,
  hasFocus,
  enabled,
}: ShouldPlayChatSoundInput): boolean => enabled && !isOwnMessage && !(isViewing && hasFocus);
