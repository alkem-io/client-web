import { Scene, type WhiteboardSnapshot } from '@excalidraw-yjs/excalidraw/headless';
import {
  type CollaborationState,
  UnifiedCollabProvider,
} from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';

// A source is a separate collaborative document. Its only deadline belongs to
// this one-shot caller; the provider must never restart a progressing first sync.
const LOAD_TIMEOUT_MS = 120_000;

/** Load a whiteboard through the collaboration transport without exposing its Yjs update through GraphQL. */
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
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const finish = (result: { scene: WhiteboardSnapshot } | { error: Error }) => {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      options.signal?.removeEventListener('abort', handleAbort);
      provider.off('state', handleState);
      provider.destroy();
      scene.destroy();
      if ('scene' in result) resolve(result.scene);
      else reject(result.error);
    };

    const handleState = (state: CollaborationState) => {
      if (state.status === 'ready') {
        finish({
          scene: {
            elements: [...scene.getElementsIncludingDeleted()],
            assets: scene.getAssetLocators(),
            appState: scene.getPersistedAppState(),
          },
        });
      } else if (state.status === 'closed' && state.reason) {
        finish({ error: new Error(`Unable to load whiteboard template: ${state.reason}`) });
      }
    };

    const handleAbort = () => {
      finish({ error: new Error('Whiteboard template load cancelled') });
    };

    timeout = setTimeout(() => finish({ error: new Error('Timed out loading whiteboard template') }), LOAD_TIMEOUT_MS);
    provider.on('state', handleState);
    options.signal?.addEventListener('abort', handleAbort, { once: true });
    if (options.signal?.aborted) {
      handleAbort();
      return;
    }
    provider.connect();
  });
};
