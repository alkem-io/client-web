import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => {
  const scene = {
    encodeStateVector: vi.fn(() => new Uint8Array([1])),
    encodeStateAsUpdate: vi.fn(() => new Uint8Array([2])),
    applyRemoteUpdate: vi.fn(),
    onDocUpdate: vi.fn(() => vi.fn()),
    getElementsIncludingDeleted: vi.fn(() => [{ id: 'template-element' }]),
    getAssetLocators: vi.fn(() => ({ image: 'source-document' })),
    getPersistedAppState: vi.fn(() => ({ viewBackgroundColor: '#fff' })),
    destroy: vi.fn(),
  };

  class MockScene {
    encodeStateVector = scene.encodeStateVector;
    encodeStateAsUpdate = scene.encodeStateAsUpdate;
    applyRemoteUpdate = scene.applyRemoteUpdate;
    onDocUpdate = scene.onDocUpdate;
    getElementsIncludingDeleted = scene.getElementsIncludingDeleted;
    getAssetLocators = scene.getAssetLocators;
    getPersistedAppState = scene.getPersistedAppState;
    destroy = scene.destroy;
  }

  type Listener = (...args: never[]) => void;
  class MockProvider {
    static instance: MockProvider;
    listeners = new Map<string, Listener>();
    options: unknown;
    connect = vi.fn();
    destroy = vi.fn();

    constructor(options: unknown) {
      this.options = options;
      MockProvider.instance = this;
    }

    on(event: string, listener: Listener) {
      this.listeners.set(event, listener);
    }

    off(event: string) {
      this.listeners.delete(event);
    }

    emit(event: string, value: unknown) {
      this.listeners.get(event)?.(value as never);
    }
  }

  return { scene, MockScene, MockProvider };
});

vi.mock('@excalidraw-yjs/excalidraw/headless', () => ({ Scene: h.MockScene }));
vi.mock('@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider', () => ({
  UnifiedCollabProvider: h.MockProvider,
}));

import { loadWhiteboardSceneFromCollaboration, TEMPLATE_LOAD_TIMEOUT_MS } from './loadWhiteboardSceneFromCollaboration';

describe('loadWhiteboardSceneFromCollaboration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('loads the source through the whiteboard collaboration port and returns a plain scene', async () => {
    const result = loadWhiteboardSceneFromCollaboration('source-whiteboard');
    const provider = h.MockProvider.instance;

    expect(provider.options).toMatchObject({
      documentId: 'source-whiteboard',
      type: 'whiteboard',
      connect: false,
    });
    expect(provider.connect).toHaveBeenCalledTimes(1);

    provider.emit('synced', true);

    await expect(result).resolves.toEqual({
      elements: [{ id: 'template-element' }],
      assets: { image: 'source-document' },
      appState: { viewBackgroundColor: '#fff' },
    });
    expect(provider.destroy).toHaveBeenCalledTimes(1);
    expect(h.scene.destroy).toHaveBeenCalledTimes(1);
  });

  it('rejects a terminal source-room refusal without returning an empty template', async () => {
    const result = loadWhiteboardSceneFromCollaboration('forbidden-source');
    const provider = h.MockProvider.instance;

    provider.emit('close', { code: 1008, reason: 'forbidden', disposition: 'terminal' });

    await expect(result).rejects.toThrow('Unable to load whiteboard template: forbidden');
    expect(provider.destroy).toHaveBeenCalledTimes(1);
    expect(h.scene.destroy).toHaveBeenCalledTimes(1);
  });

  it('destroys the temporary source provider immediately when the import is cancelled', async () => {
    const controller = new AbortController();
    const result = loadWhiteboardSceneFromCollaboration('slow-source', { signal: controller.signal });
    const provider = h.MockProvider.instance;

    expect(provider.connect).toHaveBeenCalledTimes(1);
    controller.abort();

    await expect(result).rejects.toThrow('Whiteboard template load cancelled');
    expect(provider.destroy).toHaveBeenCalledTimes(1);
    expect(h.scene.destroy).toHaveBeenCalledTimes(1);
  });

  it('does not abort a source that is still progressing past the old 30-second caller timeout', async () => {
    vi.useFakeTimers();
    const result = loadWhiteboardSceneFromCollaboration('large-source');
    let settled = false;
    void result.finally(() => {
      settled = true;
    });

    await vi.advanceTimersByTimeAsync(30_001);
    expect(settled).toBe(false);
    h.MockProvider.instance.emit('synced', true);
    await expect(result).resolves.toMatchObject({ elements: [{ id: 'template-element' }] });
  });

  it('retains a last-resort caller deadline beyond two liveness cycles', async () => {
    vi.useFakeTimers();
    const result = loadWhiteboardSceneFromCollaboration('stalled-source');
    const rejection = expect(result).rejects.toThrow('Timed out loading whiteboard template');

    await vi.advanceTimersByTimeAsync(TEMPLATE_LOAD_TIMEOUT_MS);
    await rejection;
    expect(h.MockProvider.instance.destroy).toHaveBeenCalledTimes(1);
  });
});
