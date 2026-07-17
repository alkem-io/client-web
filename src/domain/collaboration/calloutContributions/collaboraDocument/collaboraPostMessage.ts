/**
 * Shared helpers for the Collabora Online postMessage protocol, used by the hooks that listen to
 * the editor iframe (`useCollaboraPostMessage`).
 *
 * See https://sdk.collaboraonline.com/docs/postmessage_api.html
 */

export type CollaboraMessage = {
  MessageId?: string;
  Values?: Record<string, unknown>;
};

/** Parse a Collabora postMessage payload (a JSON string or an already-parsed object) into a message. */
export function parseCollaboraMessage(raw: unknown): CollaboraMessage | null {
  const value = typeof raw === 'string' ? safeJsonParse(raw) : raw;
  return value !== null && typeof value === 'object' ? (value as CollaboraMessage) : null;
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * True when a message event originates from the given editor iframe's own content window. The
 * editor URL host varies per deployment, so we validate the source window rather than the origin.
 */
export function isMessageFromIframe(event: MessageEvent, iframe: HTMLIFrameElement | null): boolean {
  return iframe !== null && event.source === iframe.contentWindow;
}
