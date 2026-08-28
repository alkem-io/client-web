import { Scene, type WhiteboardSnapshot } from '@excalidraw-yjs/excalidraw/headless';
import {
  type CloseVerdict,
  UnifiedCollabProvider,
} from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';

// A caller-owned last-resort cap, deliberately longer than two complete
// probe+grace liveness cycles. Progressing sync is governed by provider inbound
// liveness and is never killed at the old fixed 15/30-second boundary.
export const TEMPLATE_LOAD_TIMEOUT_MS = 120_000;

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
      provider.off('synced', handleSynced);
      provider.off('close', handleClose);
      provider.destroy();
      scene.destroy();
      if ('scene' in result) resolve(result.scene);
      else reject(result.error);
    };

    const handleSynced = (synced: boolean) => {
      if (!synced) return;
      finish({
        scene: {
          elements: [...scene.getElementsIncludingDeleted()],
          assets: scene.getAssetLocators(),
          appState: scene.getPersistedAppState(),
        },
      });
    };

    const handleClose = (verdict: CloseVerdict) => {
      if (verdict.disposition === 'terminal') {
        finish({ error: new Error(`Unable to load whiteboard template: ${verdict.reason || verdict.code}`) });
      }
    };

    const handleAbort = () => {
      finish({ error: new Error('Whiteboard template load cancelled') });
    };

    timeout = setTimeout(
      () => finish({ error: new Error('Timed out loading whiteboard template') }),
      TEMPLATE_LOAD_TIMEOUT_MS
    );
    provider.on('synced', handleSynced);
    provider.on('close', handleClose);
    options.signal?.addEventListener('abort', handleAbort, { once: true });
    if (options.signal?.aborted) {
      handleAbort();
      return;
    }
    provider.connect();
  });
};
