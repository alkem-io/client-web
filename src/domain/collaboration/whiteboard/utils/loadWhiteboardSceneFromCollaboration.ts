import { Scene, type WhiteboardSnapshot } from '@excalidraw-yjs/excalidraw/headless';
import {
  type CloseVerdict,
  UnifiedCollabProvider,
} from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';

const LOAD_TIMEOUT_MS = 30_000;

/** Load a whiteboard through the collaboration transport without exposing its Yjs update through GraphQL. */
export const loadWhiteboardSceneFromCollaboration = (whiteboardId: string): Promise<WhiteboardSnapshot> => {
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

    const finish = (result: { scene: WhiteboardSnapshot } | { error: Error }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
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
      if (verdict.disposition === 'terminal' || verdict.disposition === 'normal') {
        finish({ error: new Error(`Unable to load whiteboard template: ${verdict.reason || verdict.code}`) });
      }
    };

    const timeout = setTimeout(
      () => finish({ error: new Error('Timed out loading whiteboard template') }),
      LOAD_TIMEOUT_MS
    );
    provider.on('synced', handleSynced);
    provider.on('close', handleClose);
    provider.connect();
  });
};
