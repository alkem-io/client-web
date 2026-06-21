import { exportSceneJSON, hashDocState, populateYDoc } from '@alkemio/excalidraw-yjs-binding';
import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { hashWhiteboardContent, parseWhiteboardContentToScene } from './whiteboardContent';

const sceneWithRect = JSON.stringify({
  type: 'excalidraw',
  version: 2,
  source: 'test',
  elements: [{ id: 'a', type: 'rectangle', x: 0, y: 0, width: 100, height: 50, index: 'a0' }],
  appState: { viewBackgroundColor: '#ffffff' },
  files: {},
});

describe('parseWhiteboardContentToScene', () => {
  it('returns an empty scene for undefined / empty content', () => {
    expect(parseWhiteboardContentToScene(undefined)).toEqual({ elements: [], files: {}, appState: {} });
    expect(parseWhiteboardContentToScene('')).toEqual({ elements: [], files: {}, appState: {} });
    expect(parseWhiteboardContentToScene('   ')).toEqual({ elements: [], files: {}, appState: {} });
  });

  it('returns an empty scene for non-JSON or structurally-invalid content (no throw)', () => {
    expect(parseWhiteboardContentToScene('not json')).toEqual({ elements: [], files: {}, appState: {} });
    expect(parseWhiteboardContentToScene('{"foo":1}')).toEqual({ elements: [], files: {}, appState: {} });
  });

  it('parses a valid scene into the binding SceneJSON shape', () => {
    const scene = parseWhiteboardContentToScene(sceneWithRect);
    expect(scene.elements).toHaveLength(1);
    expect(scene.elements[0]).toMatchObject({ id: 'a', type: 'rectangle' });
    expect(scene.files).toEqual({});
    expect(scene.appState).toEqual({ viewBackgroundColor: '#ffffff' });
  });

  it('round-trips through a local Y.Doc (populateYDoc → exportSceneJSON) preserving the element', () => {
    const doc = new Y.Doc();
    populateYDoc(parseWhiteboardContentToScene(sceneWithRect), doc);
    const back = exportSceneJSON(doc);
    expect(back.elements).toHaveLength(1);
    expect(back.elements[0]).toMatchObject({ id: 'a', type: 'rectangle', x: 0, y: 0 });
    doc.destroy();
  });
});

describe('hashWhiteboardContent', () => {
  it('is stable for the same content', () => {
    expect(hashWhiteboardContent(sceneWithRect)).toBe(hashWhiteboardContent(sceneWithRect));
  });

  it('treats empty / undefined / blank content as the same (empty) hash', () => {
    const empty = hashWhiteboardContent(undefined);
    expect(hashWhiteboardContent('')).toBe(empty);
    expect(hashWhiteboardContent('   ')).toBe(empty);
  });

  it('differs when an element property changes (dirty-detection)', () => {
    const moved = JSON.stringify({
      type: 'excalidraw',
      version: 2,
      source: 'test',
      elements: [{ id: 'a', type: 'rectangle', x: 999, y: 0, width: 100, height: 50, index: 'a0' }],
      appState: { viewBackgroundColor: '#ffffff' },
      files: {},
    });
    expect(hashWhiteboardContent(sceneWithRect)).not.toBe(hashWhiteboardContent(moved));
  });

  it('matches the hash of a live doc seeded from the same content (dirty-check parity)', () => {
    const doc = new Y.Doc();
    populateYDoc(parseWhiteboardContentToScene(sceneWithRect), doc);
    // A freshly-loaded doc must hash equal to the stored-content hash, so the
    // single-user dialog reports "not dirty" right after open.
    expect(hashDocState(doc)).toBe(hashWhiteboardContent(sceneWithRect));
    doc.destroy();
  });
});
