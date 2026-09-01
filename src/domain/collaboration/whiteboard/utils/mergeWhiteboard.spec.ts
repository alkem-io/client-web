import { beforeEach, describe, expect, it, vi } from 'vitest';

// Control the template scene directly and exercise only the merge/asset-copy
// logic: the fork snapshot codec is stubbed so the test owns `templateScene`,
// and the lazy fork import returns the stubbed module.
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
  initialElements: Array<Record<string, unknown>>;
  assetLocators: Record<string, string>;
  flushAssetPublication: () => Promise<{
    published: string[];
    skipped: Array<{ fileId: string; reason: string }>;
    failed: Array<{ fileId: string; error: unknown }>;
  }>;
}>;

const makeApi = (o: ApiOverrides = {}) => {
  let elements = o.initialElements ?? [];
  return {
    addFiles: vi.fn(),
    flushAssetPublication: vi.fn(
      o.flushAssetPublication ?? (async () => ({ published: ['f1'], skipped: [], failed: [] }))
    ),
    getSceneAssetLocators: vi.fn(() => o.assetLocators ?? { f1: 'target-doc-id' }),
    getSceneElementsIncludingDeleted: vi.fn(() => elements),
    updateScene: vi.fn(({ elements: nextElements }) => {
      elements = nextElements;
    }),
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

    await expect(mergeWhiteboard(api as never, h.templateScene as never, makeAdapter())).rejects.toThrow(
      'Whiteboard verification failed'
    );
    expect(api.updateScene).not.toHaveBeenCalled();
  });

  it('rejects a live image whose file id has no source locator before mutating the target', async () => {
    h.templateScene = { ...makeTemplateScene(), assets: {} };
    const api = makeApi();

    await expect(mergeWhiteboard(api as never, h.templateScene as never, makeAdapter())).rejects.toThrow(
      'Template images have no source locator: f1'
    );
    expect(api.addFiles).not.toHaveBeenCalled();
    expect(api.flushAssetPublication).not.toHaveBeenCalled();
    expect(api.updateScene).not.toHaveBeenCalled();
  });

  it('ignores deleted image elements instead of importing their tombstones', async () => {
    h.templateScene = {
      ...makeTemplateScene(),
      elements: [
        { ...makeTemplateScene().elements[0], isDeleted: true },
        {
          id: 'visible',
          type: 'rectangle',
          x: 0,
          y: 0,
          width: 10,
          height: 10,
          version: 1,
          boundElements: null,
        },
      ],
      assets: {},
    };
    const api = makeApi();

    await mergeWhiteboard(api as never, h.templateScene as never, makeAdapter());

    expect(api.addFiles).not.toHaveBeenCalled();
    expect(api.flushAssetPublication).not.toHaveBeenCalled();
    expect(api.updateScene).toHaveBeenCalledTimes(1);
    expect(api.updateScene.mock.calls[0][0].elements).toHaveLength(1);
    expect(api.updateScene.mock.calls[0][0].elements[0].type).toBe('rectangle');
  });

  it('rejects a deleted-only template without reporting a visible import', async () => {
    h.templateScene = {
      ...makeTemplateScene(),
      elements: [{ ...makeTemplateScene().elements[0], isDeleted: true }],
      assets: {},
    };
    const api = makeApi();

    await expect(mergeWhiteboard(api as never, h.templateScene as never, makeAdapter())).rejects.toThrow(
      'Template has no visible elements'
    );
    expect(api.updateScene).not.toHaveBeenCalled();
    expect(api.scrollToContent).not.toHaveBeenCalled();
  });

  it('resolves source bytes and commits a target locator before inserting the template', async () => {
    const api = makeApi();
    const resolve = vi.fn(async () => RESOLVED_BYTES);
    await mergeWhiteboard(api as never, h.templateScene as never, makeAdapter(resolve));

    // resolve is called with the fileId + the SOURCE locator
    expect(resolve).toHaveBeenCalledWith('f1', 'source-doc-id');
    // Only unpublished bytes enter the target editor; the source locator never does.
    expect(api.addFiles).toHaveBeenCalledWith([RESOLVED_BYTES]);
    expect(api.flushAssetPublication).toHaveBeenCalledTimes(1);
    expect(api.getSceneAssetLocators).toHaveBeenCalledTimes(1);
    expect(api.updateScene).toHaveBeenCalledTimes(1);
    expect(api.flushAssetPublication.mock.invocationCallOrder[0]).toBeLessThan(
      api.updateScene.mock.invocationCallOrder[0]
    );
    const inserted = (api.updateScene.mock.calls[0][0] as { elements: Array<Record<string, unknown>> }).elements;
    expect(inserted).toHaveLength(1);
    expect(inserted[0].fileId).toBe('f1');
    // pin: no image BYTES / source URL leak into the scene elements
    expect(JSON.stringify(inserted)).not.toContain('data:image');
    expect(JSON.stringify(inserted)).not.toContain('source-doc-id');
  });

  it('inserts no elements when target publication fails', async () => {
    const api = makeApi({
      flushAssetPublication: async () => ({
        published: [],
        skipped: [],
        failed: [{ fileId: 'f1', error: new Error('upload failed') }],
      }),
    });

    await expect(mergeWhiteboard(api as never, h.templateScene as never, makeAdapter())).rejects.toThrow(
      'Unable to publish template images: f1'
    );
    expect(api.addFiles).toHaveBeenCalledWith([RESOLVED_BYTES]);
    expect(api.updateScene).not.toHaveBeenCalled();
  });

  it('inserts no elements when publication reports success without committing a target locator', async () => {
    const api = makeApi({ assetLocators: {} });

    await expect(mergeWhiteboard(api as never, h.templateScene as never, makeAdapter())).rejects.toThrow(
      'Template images have no committed target locator: f1'
    );
    expect(api.flushAssetPublication).toHaveBeenCalledTimes(1);
    expect(api.updateScene).not.toHaveBeenCalled();
  });

  it('settles promptly on abort while target publication remains pending', async () => {
    const api = makeApi({ flushAssetPublication: () => new Promise(() => undefined) });
    const controller = new AbortController();

    const merge = mergeWhiteboard(api as never, h.templateScene as never, makeAdapter(), {
      signal: controller.signal,
    });
    await vi.waitFor(() => expect(api.flushAssetPublication).toHaveBeenCalledTimes(1));
    controller.abort();

    await expect(merge).rejects.toThrow('Whiteboard template import cancelled');
    expect(api.updateScene).not.toHaveBeenCalled();
  });

  it('aborts with zero mutations when a source locator fails to resolve', async () => {
    const api = makeApi();
    const resolve = vi.fn(async () => {
      throw new Error('gone');
    });
    await expect(mergeWhiteboard(api as never, h.templateScene as never, makeAdapter(resolve))).rejects.toThrow();
    expect(api.addFiles).not.toHaveBeenCalled();
    expect(api.updateScene).not.toHaveBeenCalled();
  });

  it('settles promptly on abort while source resolution remains pending', async () => {
    const api = makeApi();
    const resolve = vi.fn(() => new Promise<typeof RESOLVED_BYTES>(() => undefined));
    const controller = new AbortController();

    const merge = mergeWhiteboard(api as never, h.templateScene as never, makeAdapter(resolve), {
      signal: controller.signal,
    });
    await vi.waitFor(() => expect(resolve).toHaveBeenCalledTimes(1));
    controller.abort();

    await expect(merge).rejects.toThrow('Whiteboard template import cancelled');
    expect(api.addFiles).not.toHaveBeenCalled();
    expect(api.updateScene).not.toHaveBeenCalled();
  });

  it('aborts before the synchronous target edit when its editor lease is no longer current', async () => {
    const api = makeApi();
    let finishResolve: ((file: typeof RESOLVED_BYTES) => void) | undefined;
    const resolve = vi.fn(
      () =>
        new Promise<typeof RESOLVED_BYTES>(finish => {
          finishResolve = finish;
        })
    );
    let leaseValid = true;

    const merge = mergeWhiteboard(api as never, h.templateScene as never, makeAdapter(resolve), {
      targetLeaseValid: () => leaseValid,
    });
    await vi.waitFor(() => expect(resolve).toHaveBeenCalledTimes(1));
    leaseValid = false;
    finishResolve?.(RESOLVED_BYTES);

    await expect(merge).rejects.toThrow('Whiteboard editor changed while importing template');
    expect(api.addFiles).not.toHaveBeenCalled();
    expect(api.updateScene).not.toHaveBeenCalled();
  });

  it('never reuses a locator already present in the target when importing source bytes', async () => {
    const api = makeApi();
    const resolve = vi.fn(async () => RESOLVED_BYTES);
    await mergeWhiteboard(api as never, h.templateScene as never, makeAdapter(resolve));

    expect(resolve).toHaveBeenCalledWith('f1', 'source-doc-id');
    expect(api.addFiles).toHaveBeenCalledWith([RESOLVED_BYTES]);
    expect(api.flushAssetPublication).toHaveBeenCalledTimes(1);
    expect(api.updateScene).toHaveBeenCalledTimes(1);
  });

  it('preserves existing content and inserts a fresh displaced copy every time the same template is applied', async () => {
    h.templateScene = {
      elements: [
        {
          id: 'template-element',
          type: 'rectangle',
          x: 0,
          y: 0,
          width: 10,
          height: 10,
          version: 1,
          boundElements: null,
        },
      ],
      assets: {},
      appState: {},
    };
    const existing = {
      id: 'existing-element',
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      version: 1,
      boundElements: null,
    };
    const api = makeApi({ initialElements: [existing] });

    await mergeWhiteboard(api as never, h.templateScene as never, makeAdapter());
    await mergeWhiteboard(api as never, h.templateScene as never, makeAdapter());

    expect(api.updateScene).toHaveBeenCalledTimes(2);
    const firstElements = api.updateScene.mock.calls[0][0].elements as Array<Record<string, unknown>>;
    const secondElements = api.updateScene.mock.calls[1][0].elements as Array<Record<string, unknown>>;
    expect(firstElements[0]).toBe(existing);
    expect(secondElements[0]).toBe(existing);
    expect(firstElements).toHaveLength(2);
    expect(secondElements).toHaveLength(3);
    expect(firstElements[1].id).not.toBe('template-element');
    expect(secondElements[2].id).not.toBe('template-element');
    expect(secondElements[2].id).not.toBe(firstElements[1].id);
    expect(firstElements[1].x).toBeGreaterThan(existing.x + existing.width);
    expect(secondElements[2].x).toBeGreaterThan(firstElements[1].x as number);
  });

  it('ignores deleted outliers when positioning visible imported content', async () => {
    h.templateScene = {
      elements: [
        {
          id: 'visible',
          type: 'rectangle',
          x: 0,
          y: 0,
          width: 10,
          height: 10,
          version: 1,
          boundElements: null,
        },
        {
          id: 'deleted-outlier',
          type: 'rectangle',
          x: -100000,
          y: -100000,
          width: 10,
          height: 10,
          version: 1,
          isDeleted: true,
          boundElements: null,
        },
      ],
      assets: {},
      appState: {},
    };
    const existing = {
      id: 'existing',
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      version: 1,
      boundElements: null,
    };
    const api = makeApi({ initialElements: [existing] });

    await mergeWhiteboard(api as never, h.templateScene as never, makeAdapter());

    const inserted = api.updateScene.mock.calls[0][0].elements[1];
    expect(inserted.x).toBeGreaterThan(existing.x + existing.width);
    expect(api.updateScene.mock.calls[0][0].elements).toHaveLength(2);
  });

  it('regenerates frame, binding, and group relationships within each imported copy', async () => {
    h.templateScene = {
      elements: [
        {
          id: 'frame',
          type: 'frame',
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          version: 1,
          groupIds: ['group'],
          boundElements: [{ id: 'arrow', type: 'arrow' }],
        },
        {
          id: 'rectangle',
          type: 'rectangle',
          x: 10,
          y: 10,
          width: 20,
          height: 20,
          version: 1,
          frameId: 'frame',
          groupIds: ['group'],
          boundElements: [{ id: 'arrow', type: 'arrow' }],
        },
        {
          id: 'arrow',
          type: 'arrow',
          x: 20,
          y: 20,
          width: 40,
          height: 40,
          version: 1,
          groupIds: ['group'],
          startBinding: { elementId: 'rectangle' },
          endBinding: { elementId: 'frame' },
          boundElements: null,
        },
      ],
      assets: {},
      appState: {},
    };
    const api = makeApi();

    await mergeWhiteboard(api as never, h.templateScene as never, makeAdapter());
    await mergeWhiteboard(api as never, h.templateScene as never, makeAdapter());

    const firstCopy = api.updateScene.mock.calls[0][0].elements as Array<Record<string, unknown>>;
    const secondScene = api.updateScene.mock.calls[1][0].elements as Array<Record<string, unknown>>;
    const secondCopy = secondScene.slice(3);
    const assertCopyRelationships = (copy: Array<Record<string, unknown>>) => {
      const [frame, rectangle, arrow] = copy as Array<
        Record<string, unknown> & {
          id: string;
          frameId?: string;
          groupIds: string[];
          boundElements?: Array<{ id: string }>;
          startBinding?: { elementId: string };
          endBinding?: { elementId: string };
        }
      >;
      expect(rectangle.frameId).toBe(frame.id);
      expect(arrow.startBinding?.elementId).toBe(rectangle.id);
      expect(arrow.endBinding?.elementId).toBe(frame.id);
      expect(frame.boundElements?.[0].id).toBe(arrow.id);
      expect(rectangle.boundElements?.[0].id).toBe(arrow.id);
      expect(new Set(copy.flatMap(element => (element.groupIds as string[]) ?? [])).size).toBe(1);
      expect(frame.groupIds[0]).not.toBe('group');
      expect([frame.id, rectangle.id, arrow.id]).not.toContain('frame');
      return frame.groupIds[0];
    };

    const firstGroup = assertCopyRelationships(firstCopy);
    const secondGroup = assertCopyRelationships(secondCopy);
    expect(secondGroup).not.toBe(firstGroup);
  });
});
