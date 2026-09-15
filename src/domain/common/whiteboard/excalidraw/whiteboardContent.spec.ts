import { decodeSnapshot, encodeSnapshot, type WhiteboardSnapshot } from '@excalidraw-yjs/excalidraw/headless';
import { toBase64 } from 'lib0/buffer';
import { describe, expect, it } from 'vitest';
import { EmptyWhiteboardSnapshot, EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import {
  decodeWhiteboardContentUpdate,
  isEmptyWhiteboardContent,
  parseWhiteboardContentToScene,
  serializeWhiteboardContent,
} from './whiteboardContent';

// The 006 storage boundary is a base64 Yjs-V2 snapshot, NOT Excalidraw JSON — `parseWhiteboardContentToScene`
// decodes base64 and returns an empty scene for anything else. So the fixture content is built through the
// real serializer, and the snapshot-helper tests operate on the snapshot object directly.
const snapshotWithRect = {
  elements: [{ id: 'a', type: 'rectangle', x: 0, y: 0, width: 100, height: 50, index: 'a0' }],
  assets: {},
  appState: { viewBackgroundColor: '#ffffff' },
} as unknown as WhiteboardSnapshot;
const contentWithRect = serializeWhiteboardContent(snapshotWithRect);

describe('parseWhiteboardContentToScene', () => {
  it('returns an empty scene for undefined / empty content', () => {
    expect(parseWhiteboardContentToScene(undefined)).toEqual({ elements: [], assets: {}, appState: {} });
    expect(parseWhiteboardContentToScene('')).toEqual({ elements: [], assets: {}, appState: {} });
    expect(parseWhiteboardContentToScene('   ')).toEqual({ elements: [], assets: {}, appState: {} });
  });

  it('returns an empty scene for non-JSON or structurally-invalid content (no throw)', () => {
    expect(parseWhiteboardContentToScene('not json')).toEqual({ elements: [], assets: {}, appState: {} });
    expect(parseWhiteboardContentToScene('{"foo":1}')).toEqual({ elements: [], assets: {}, appState: {} });
  });

  it('returns independent empty fallback scenes', () => {
    const first = parseWhiteboardContentToScene('');
    const mutable = first as unknown as {
      elements: unknown[];
      assets: Record<string, unknown>;
      appState: Record<string, unknown>;
    };
    mutable.elements.push({ id: 'mutated' });
    mutable.assets.changed = 'locator';
    mutable.appState.changed = true;

    expect(parseWhiteboardContentToScene('')).toEqual({ elements: [], assets: {}, appState: {} });
  });

  it('parses a valid scene into the WhiteboardSnapshot shape', () => {
    const scene = parseWhiteboardContentToScene(contentWithRect);
    expect(scene.elements).toHaveLength(1);
    expect(scene.elements[0]).toMatchObject({ id: 'a', type: 'rectangle' });
    expect(scene.assets).toEqual({});
    expect(scene.appState).toEqual({ viewBackgroundColor: '#ffffff' });
  });

  it('round-trips through the native snapshot (encodeSnapshot → decodeSnapshot) preserving the element', () => {
    const back = decodeSnapshot(encodeSnapshot(snapshotWithRect));
    expect(back.elements).toHaveLength(1);
    expect(back.elements[0]).toMatchObject({ id: 'a', type: 'rectangle', x: 0, y: 0 });
  });
});

describe('decodeWhiteboardContentUpdate', () => {
  it('returns null for undefined / empty / whitespace content', () => {
    expect(decodeWhiteboardContentUpdate(undefined)).toBeNull();
    expect(decodeWhiteboardContentUpdate('')).toBeNull();
    expect(decodeWhiteboardContentUpdate('   ')).toBeNull();
  });

  it('returns null for non-base64 content (FR-010 fallback, no throw)', () => {
    // `fromBase64` is lenient (produces garbage bytes rather than throwing), so the guard is the
    // subsequent `decodeSnapshot`, which rejects the malformed update — the helper catches it.
    expect(decodeWhiteboardContentUpdate('!!not-base64!!')).toBeNull();
    expect(decodeWhiteboardContentUpdate('not json')).toBeNull();
  });

  it('returns null for a valid-base64 but malformed-v2 buffer (FR-010 fallback, no throw)', () => {
    const malformedV2 = toBase64(new Uint8Array([1, 2, 3, 4, 5]));
    expect(decodeWhiteboardContentUpdate(malformedV2)).toBeNull();
  });

  it('returns applyable bytes for a well-formed stored snapshot', () => {
    const bytes = decodeWhiteboardContentUpdate(contentWithRect);
    expect(bytes).toBeInstanceOf(Uint8Array);
    // The returned bytes are validated (decodeSnapshot succeeded), so they decode to the scene.
    expect(parseWhiteboardContentToScene(contentWithRect).elements).toHaveLength(1);
  });
});

describe('serializeWhiteboardContent', () => {
  it('serializes to a base64 Yjs-V2 snapshot that parses back to the same scene', () => {
    // serialize → parse is the storage-boundary round-trip: the stored `content` is a
    // base64-encoded Yjs-V2 snapshot, and parsing it (decodeSnapshot ∘ fromBase64) must
    // recover the element. (Per-peer reconciliation metadata is normalized away by the
    // doc round-trip, so we assert on stable element identity/geometry, not byte parity.)
    const content = serializeWhiteboardContent(snapshotWithRect);
    expect(typeof content).toBe('string');
    const scene = parseWhiteboardContentToScene(content);
    expect(scene.elements).toHaveLength(1);
    expect(scene.elements[0]).toMatchObject({ id: 'a', type: 'rectangle', x: 0, y: 0, width: 100, height: 50 });
  });

  it('serializes an empty scene to a parseable empty snapshot', () => {
    const content = serializeWhiteboardContent({ elements: [], assets: {}, appState: {} });
    expect(parseWhiteboardContentToScene(content)).toMatchObject({ elements: [] });
  });
});

describe('isEmptyWhiteboardContent', () => {
  it('treats missing / blank content as empty', () => {
    expect(isEmptyWhiteboardContent(undefined)).toBe(true);
    expect(isEmptyWhiteboardContent('')).toBe(true);
    expect(isEmptyWhiteboardContent('   ')).toBe(true);
  });

  it('normalizes TWO INDEPENDENTLY-encoded empty snapshots — even though their bytes differ', () => {
    // The empty encoding is non-deterministic: each encode builds a fresh Y.Doc with a
    // random clientID, so serializing the same empty snapshot twice yields DIFFERENT
    // base64. A byte-equality check (`content === EmptyWhiteboardString`) therefore
    // misclassifies a freshly-encoded empty as real content — the bug this predicate fixes.
    const a = serializeWhiteboardContent(EmptyWhiteboardSnapshot);
    const b = serializeWhiteboardContent(EmptyWhiteboardSnapshot);
    expect(a).not.toBe(b); // proves the non-determinism byte-equality cannot survive
    expect(a).not.toBe(EmptyWhiteboardString);
    // ...yet all three are recognised as empty by the semantic predicate:
    expect(isEmptyWhiteboardContent(a)).toBe(true);
    expect(isEmptyWhiteboardContent(b)).toBe(true);
    expect(isEmptyWhiteboardContent(EmptyWhiteboardString)).toBe(true);
  });

  it('does NOT treat a scene with live elements as empty', () => {
    expect(isEmptyWhiteboardContent(contentWithRect)).toBe(false);
  });

  it('does NOT treat a scene that carries assets as empty (assets are preserved)', () => {
    const withAsset = serializeWhiteboardContent({
      elements: [],
      assets: { 'file-1': 'locator-1' },
      appState: {},
    } as unknown as WhiteboardSnapshot);
    expect(isEmptyWhiteboardContent(withAsset)).toBe(false);
  });
});
