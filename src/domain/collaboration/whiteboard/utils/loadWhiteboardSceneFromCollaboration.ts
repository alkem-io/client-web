import { Scene, type WhiteboardSnapshot } from '@excalidraw-yjs/excalidraw/headless';
import { UnifiedCollabProvider } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';

/**
 * Load one source document through its own ordinary provider, then dispose it.
 * There is deliberately no wall-clock deadline: progressing templates stay patient.
 * The owner's AbortSignal settles chooser cancel, target close, scene loss, editor
 * disposal, and unmount; provider readiness or a terminal end settles the rest.
 */
export const loadWhiteboardSceneFromCollaboration = (
  whiteboardId: string,
  options: { signal?: AbortSignal } = {}
): Promise<WhiteboardSnapshot> => {
  const scene = new Scene();
  const provider = new UnifiedCollabProvider({
    documentId: whiteboardId,
    type: 'whiteboard',
    scenePort: {
      encodeSceneStateVector: () => scene.encodeStateVector(),
      encodeSceneAsUpdate: (format, targetStateVector) => scene.encodeStateAsUpdate(format, targetStateVector),
      applyRemoteSceneUpdate: (update, format) => scene.applyRemoteUpdate(update, format),
      onLocalSceneUpdate: (listener, format) => scene.onDocUpdate(listener, format),
    },
    connect: false,
  });

  return new Promise((resolve, reject) => {
    let settled = false;
    let unsubscribe = () => {};
    const finish = (result: WhiteboardSnapshot | Error) => {
      if (settled) return;
      settled = true;
      options.signal?.removeEventListener('abort', abort);
      unsubscribe();
      provider.destroy();
      scene.destroy();
      if (result instanceof Error) reject(result);
      else resolve(result);
    };
    const abort = () => finish(new Error('Whiteboard template load cancelled'));
    unsubscribe = provider.subscribe(state => {
      if (state.kind === 'active') {
        finish({
          elements: [...scene.getElementsIncludingDeleted()],
          assets: scene.getAssetLocators(),
          appState: scene.getPersistedAppState(),
        });
      } else if (state.kind === 'ended') {
        finish(new Error(`Unable to load whiteboard template: ${state.reason}`));
      }
    });
    options.signal?.addEventListener('abort', abort, { once: true });
    if (options.signal?.aborted) abort();
    else provider.connect();
  });
};
