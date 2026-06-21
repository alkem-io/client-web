import { hashDocState, populateYDoc, type SceneJSON } from '@alkemio/excalidraw-yjs-binding';
import * as Y from 'yjs';

/** An empty scene — the editor seed for a brand-new / empty / unreadable whiteboard. */
const EMPTY_SCENE: SceneJSON = { elements: [], files: {}, appState: {} };

/**
 * Parse the stored whiteboard `content` (an Excalidraw scene JSON string — the
 * boundary representation, R1) into the binding's `SceneJSON` shape so it can seed
 * a local `Y.Doc` via `populateYDoc`. Empty / non-JSON / structurally-absent
 * content (`elements` missing) yields an empty scene rather than throwing, so an
 * empty-on-create whiteboard opens empty and editable (FR-010). Mirrors the
 * server's `parseScene` (whiteboard.scene.to.yjs.v2.state.ts) so client + server
 * seed identical docs from the same content.
 */
export function parseWhiteboardContentToScene(content: string | undefined): SceneJSON {
  if (!content || content.trim() === '') {
    return EMPTY_SCENE;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return EMPTY_SCENE;
  }
  if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as { elements?: unknown }).elements)) {
    return EMPTY_SCENE;
  }
  const scene = parsed as {
    elements: SceneJSON['elements'];
    files?: SceneJSON['files'];
    appState?: SceneJSON['appState'];
  };
  return {
    elements: scene.elements,
    files: scene.files ?? {},
    appState: scene.appState ?? {},
  };
}

/**
 * Content-addressed hash of a stored whiteboard `content` string, computed by
 * seeding a throwaway local `Y.Doc` from the scene and hashing its state — the
 * Yjs-native dirty-check (replacing the legacy JSON deep-compare). Two contents
 * that converge to the same scene hash identically; insertion order / per-peer
 * reconciliation metadata are invariant (binding `hashDocState`).
 */
export function hashWhiteboardContent(content: string | undefined): string {
  const doc = new Y.Doc();
  populateYDoc(parseWhiteboardContentToScene(content), doc);
  const hash = hashDocState(doc);
  doc.destroy();
  return hash;
}
