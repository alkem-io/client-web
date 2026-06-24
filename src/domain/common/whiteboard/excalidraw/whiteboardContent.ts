import { decodeSnapshot, encodeSnapshot, type WhiteboardSnapshot } from '@excalidraw-yjs/element';
import { fromBase64, toBase64 } from 'lib0/buffer';

/** An empty scene — the editor seed for a brand-new / empty / unreadable whiteboard. */
const EMPTY_SCENE: WhiteboardSnapshot = { elements: [], files: {}, appState: {} };

/**
 * Parse the stored whiteboard `content` (the 006 boundary: a base64-encoded Yjs-V2
 * snapshot) into the native core's `WhiteboardSnapshot` ({@link WhiteboardSnapshot} =
 * `{ elements, files, appState }`) — the seed the editor adopts as its `Scene.doc`.
 * Native Yjs ONLY — there is no legacy/JSON conversion here: dev-host legacy
 * whiteboards are throwaway, and production legacy→Yjs migration is a separate
 * server-side job. Empty or non-Yjs content yields an empty scene (FR-010). The
 * server decodes the identical format (`Buffer.from(content, 'base64')` →
 * `Y.applyUpdateV2`) so client + server seed identical docs.
 */
export function parseWhiteboardContentToScene(content: string | undefined): WhiteboardSnapshot {
  if (!content || content.trim() === '') {
    return EMPTY_SCENE;
  }
  try {
    return decodeSnapshot(fromBase64(content));
  } catch {
    return EMPTY_SCENE;
  }
}

/**
 * Serialize a snapshot to the stored whiteboard `content` (the 006 boundary): a
 * base64-encoded Yjs-V2 update over the native element schema — the format the
 * server stores and the collaboration-service seeds a room from (NOT Excalidraw
 * JSON; the server rejects JSON with error 12101). Inverse of
 * {@link parseWhiteboardContentToScene}.
 */
export function serializeWhiteboardContent(snapshot: WhiteboardSnapshot): string {
  return toBase64(encodeSnapshot(snapshot));
}
