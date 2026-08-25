import { beforeEach, describe, expect, it, vi } from 'vitest';

// Control the template scene directly and exercise only the merge/asset-copy
// logic: the fork snapshot codec + the content parser are stubbed so the test
// owns `templateScene`, and the lazy fork import returns the stubbed module.
const makeTemplateScene = () => ({
  elements: [
    {
      id: 'el1',
      type: 'image',
      fileId: 'f1',
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      version: 1,
      boundElements: null,
    },
  ],
  assets: { f1: 'source-doc-id' },
  appState: {},
});

const h = vi.hoisted(() => ({ templateScene: undefined as unknown }));

vi.mock('@excalidraw-yjs/excalidraw/headless', () => ({
  encodeSnapshot: (s: unknown) => s,
  decodeSnapshot: (s: unknown) => s,
}));
vi.mock('@excalidraw-yjs/excalidraw', () => ({
  hashElementsVersion: () => 1,
  CaptureUpdateAction: { IMMEDIATELY: 'immediately' },
}));
vi.mock('@/domain/common/whiteboard/excalidraw/whiteboardContent', () => ({
  parseWhiteboardContentToScene: () => h.templateScene,
}));
vi.mock('@/core/lazyLoading/lazyWithGlobalErrorHandler', () => ({
  lazyImportWithErrorHandler: async (fn: () => Promise<unknown>) => fn(),
}));

import mergeWhiteboard from './mergeWhiteboard';

const RESOLVED_BYTES = {
  id: 'f1',
  dataURL: 'data:image/png;base64,AAAA',
  mimeType: 'image/png',
  created: 1,
} as never;

type ApiOverrides = Partial<{
  getFiles: () => Record<string, unknown>;
  sceneLocatorsSequence: Array<Record<string, string>>;
  flushReport: { published: string[]; skipped: unknown[]; failed: Array<{ fileId: string; error: unknown }> };
}>;

const makeApi = (o: ApiOverrides = {}) => {
  const locatorsSeq = o.sceneLocatorsSequence ?? [{}, { f1: 'target-doc-id' }];
  let call = 0;
  return {
    getFiles: vi.fn(o.getFiles ?? (() => ({}))),
    getSceneAssetLocators: vi.fn(() => locatorsSeq[Math.min(call++, locatorsSeq.length - 1)]),
    addFiles: vi.fn(),
    flushAssetPublication: vi.fn(async () => o.flushReport ?? { published: ['f1'], skipped: [], failed: [] }),
    getSceneElementsIncludingDeleted: vi.fn(() => []),
    updateScene: vi.fn(),
    scrollToContent: vi.fn(),
  };
};

const makeAdapter = (resolve = vi.fn(async () => RESOLVED_BYTES)) => ({ store: vi.fn(), resolve }) as never;

describe('mergeWhiteboard asset re-homing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.templateScene = makeTemplateScene();
  });

  it('rejects an unreadable/empty template instead of reporting a successful no-op', async () => {
    h.templateScene = { elements: [], assets: {}, appState: {} };
    const api = makeApi();

    await expect(mergeWhiteboard(api as never, 'invalid', makeAdapter())).rejects.toThrow(
      'Whiteboard verification failed'
    );
    expect(api.updateScene).not.toHaveBeenCalled();
  });

  it('resolves the source locator, re-stores into the target bucket (new id), keeps fileId, inserts the element', async () => {
    const api = makeApi();
    const resolve = vi.fn(async () => RESOLVED_BYTES);
    await mergeWhiteboard(api as never, 'content', makeAdapter(resolve));

    // resolve is called with the fileId + the SOURCE locator
    expect(resolve).toHaveBeenCalledWith('f1', 'source-doc-id');
    // bytes handed to the editor to re-publish through the same adapter.store
    expect(api.addFiles).toHaveBeenCalledWith([RESOLVED_BYTES]);
    // the target locator committed after publish differs from the source one; fileId unchanged
    const results = api.getSceneAssetLocators.mock.results;
    const committed = results[results.length - 1]?.value as Record<string, string>;
    expect(committed.f1).toBe('target-doc-id');
    expect(committed.f1).not.toBe('source-doc-id');
    // element inserted only after the locator is committed
    expect(api.updateScene).toHaveBeenCalledTimes(1);
    const inserted = (api.updateScene.mock.calls[0][0] as { elements: Array<Record<string, unknown>> }).elements;
    expect(inserted).toHaveLength(1);
    expect(inserted[0].fileId).toBe('f1');
    // pin: no image BYTES / source URL leak into the scene elements
    expect(JSON.stringify(inserted)).not.toContain('data:image');
    expect(JSON.stringify(inserted)).not.toContain('source-doc-id');
  });

  it('aborts with zero mutations when a source locator fails to resolve', async () => {
    const api = makeApi();
    const resolve = vi.fn(async () => {
      throw new Error('gone');
    });
    await expect(mergeWhiteboard(api as never, 'content', makeAdapter(resolve))).rejects.toThrow();
    expect(api.addFiles).not.toHaveBeenCalled();
    expect(api.updateScene).not.toHaveBeenCalled();
  });

  it('aborts and inserts zero elements when a target store fails in the publish flush', async () => {
    const api = makeApi({ flushReport: { published: [], skipped: [], failed: [{ fileId: 'f1', error: 'x' }] } });
    await expect(mergeWhiteboard(api as never, 'content', makeAdapter())).rejects.toThrow();
    expect(api.updateScene).not.toHaveBeenCalled();
  });

  it('aborts when a resolved file ends up with no committed target locator', async () => {
    // flush reports success but the scene has no locator for f1 (replaced/unmounted mid-merge)
    const api = makeApi({ sceneLocatorsSequence: [{}, {}] });
    await expect(mergeWhiteboard(api as never, 'content', makeAdapter())).rejects.toThrow();
    expect(api.updateScene).not.toHaveBeenCalled();
  });

  it('does not re-upload an image the target already has a locator for', async () => {
    const api = makeApi({ sceneLocatorsSequence: [{ f1: 'existing' }] });
    const resolve = vi.fn(async () => RESOLVED_BYTES);
    await mergeWhiteboard(api as never, 'content', makeAdapter(resolve));

    expect(resolve).not.toHaveBeenCalled();
    expect(api.addFiles).not.toHaveBeenCalled();
    expect(api.flushAssetPublication).not.toHaveBeenCalled();
    // elements are still inserted (the image references the pre-existing locator)
    expect(api.updateScene).toHaveBeenCalledTimes(1);
  });

  it('retries publication for cached-but-unpublished bytes WITHOUT re-resolving the source, then inserts', async () => {
    // A prior merge cached f1's bytes but its store failed → no committed locator.
    // Local bytes must NOT be mistaken for readiness: no second source resolve, but
    // publication/flush MUST run and a locator is required before insertion.
    const api = makeApi({
      getFiles: () => ({ f1: { id: 'f1' } }),
      sceneLocatorsSequence: [{}, { f1: 'target-doc-id' }],
    });
    const resolve = vi.fn(async () => RESOLVED_BYTES);
    await mergeWhiteboard(api as never, 'content', makeAdapter(resolve));

    expect(resolve).not.toHaveBeenCalled();
    expect(api.addFiles).not.toHaveBeenCalled();
    expect(api.flushAssetPublication).toHaveBeenCalledTimes(1);
    expect(api.updateScene).toHaveBeenCalledTimes(1);
  });

  it('rejects when cached bytes flush with a clean report but still commit no target locator', async () => {
    const api = makeApi({
      getFiles: () => ({ f1: { id: 'f1' } }),
      sceneLocatorsSequence: [{}, {}], // clean flush, yet no locator committed
      flushReport: { published: [], skipped: [], failed: [] },
    });
    const resolve = vi.fn(async () => RESOLVED_BYTES);
    await expect(mergeWhiteboard(api as never, 'content', makeAdapter(resolve))).rejects.toThrow();
    expect(resolve).not.toHaveBeenCalled();
    expect(api.updateScene).not.toHaveBeenCalled();
  });
});
