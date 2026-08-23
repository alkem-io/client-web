import { decodeSnapshot, encodeSnapshot, type WhiteboardSnapshot } from '@excalidraw-yjs/excalidraw/headless';
import { fromBase64, toBase64 } from 'lib0/buffer';

/** An empty scene — the editor seed for a brand-new / empty / unreadable whiteboard. */
const EMPTY_SCENE: WhiteboardSnapshot = { elements: [], assets: {}, appState: {} };

/**
 * Parse the stored whiteboard `content` (the 006 boundary: a base64-encoded Yjs-V2
 * snapshot) into the native core's `WhiteboardSnapshot` ({@link WhiteboardSnapshot} =
 * `{ elements, assets, appState }`) — the seed the editor adopts as its `Scene.doc`.
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
 * Decode the stored whiteboard `content` (the 006 boundary: a base64-encoded Yjs-V2 snapshot)
 * into the raw Yjs-V2 UPDATE bytes to seed the live editor with `applyRemoteSceneUpdate(bytes,
 * 'v2')` — the single-user / preview path, which pushes bytes straight into the editor's own
 * `Scene.doc` rather than materializing a {@link WhiteboardSnapshot}. Returns `null` for empty
 * content OR content that does not decode to a well-formed Yjs-V2 snapshot (non-base64 / malformed
 * update), so the caller seeds an EMPTY editable scene instead of throwing (FR-010, the same
 * decode-with-fallback contract as {@link parseWhiteboardContentToScene}). The bytes are validated
 * with the same `decodeSnapshot` the parser uses, so a returned buffer is guaranteed to apply
 * without throwing. This is the persisted-content seed path ONLY — NOT the fail-loud WS
 * scene-sync frame path (`unifiedCollabProvider.readSceneSyncMessage`), which must reject a
 * malformed frame loudly rather than silently empty the scene.
 */
export function decodeWhiteboardContentUpdate(content: string | undefined): Uint8Array | null {
  if (!content || content.trim() === '') {
    return null;
  }
  try {
    const update = fromBase64(content);
    // Validate through the same decoder the parser uses: throws on non-base64 garbage bytes or a
    // malformed-v2 update, so a returned buffer is safe to `applyRemoteSceneUpdate`.
    decodeSnapshot(update);
    return update;
  } catch {
    return null;
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

/**
 * Whether stored whiteboard `content` represents an EMPTY scene — nothing the user
 * drew. ALWAYS use this instead of `content === EmptyWhiteboardString`: the empty
 * encoding is a Yjs snapshot whose bytes are NON-deterministic (every encode builds a
 * fresh Y.Doc with a random clientID), so byte-equality against the module-constant
 * `EmptyWhiteboardString` silently fails across sessions/encodes — an empty default
 * then reads as real content and gets re-persisted. Empty here = no live (non-deleted)
 * elements AND no assets; a bare/default appState with no drawn content still counts as
 * empty, but user assets are preserved (an image-only scene is never treated as empty).
 */
export function isEmptyWhiteboardContent(content: string | undefined): boolean {
  if (!content || content.trim() === '') {
    return true;
  }
  const { elements, assets } = parseWhiteboardContentToScene(content);
  const hasLiveElements = elements.some(element => !(element as { isDeleted?: boolean }).isDeleted);
  const hasAssets = Object.keys(assets ?? {}).length > 0;
  return !hasLiveElements && !hasAssets;
}
