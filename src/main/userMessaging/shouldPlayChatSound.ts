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
 * suppression here is sound-only (FR-010), and the unread BADGE stays
 * selection-based.
 *
 * The READ RECEIPT is a separate, now focus-gated signal (FR-018b, gated in
 * `useConversationView` via `useIsDocumentActive`): the server cancels a pending
 * message digest when the recipient's unread count is zero, so reporting a
 * conversation read must mean the user was actually present. Read state is
 * therefore no longer focus-independent — do not reason from an older comment
 * that said it was.
 */
export const shouldPlayChatSound = ({
  isOwnMessage,
  isViewing,
  hasFocus,
  enabled,
}: ShouldPlayChatSoundInput): boolean => enabled && !isOwnMessage && !(isViewing && hasFocus);
