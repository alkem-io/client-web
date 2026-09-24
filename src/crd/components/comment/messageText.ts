import type { MessageAttachment } from './types';

/**
 * Whether a message body should be rendered as a text line above its attachments.
 *
 * A media event with no caption carries the filename as its body (MSC2530), so the
 * same string arrives as both the message text and the attachment's displayName —
 * rendering it would echo the filename above its own attachment. Element shows just
 * the media. Only for a SINGLE attachment (with several the text is ambiguous), and
 * compared on the trimmed body: a real caption that happens to equal the filename is
 * indistinguishable, and suppressing it is harmless.
 *
 * Shared by every renderer of an attachment-bearing message (chat bubbles and
 * callout/forum comments) — the same Matrix event reaches both, so a second copy of
 * this rule would drift.
 */
export const hasRenderableText = (content: string, attachments?: MessageAttachment[]): boolean => {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return false;
  }
  return !(attachments?.length === 1 && trimmed === attachments[0].displayName);
};
