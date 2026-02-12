import type { ExcalidrawElement, OrderedExcalidrawElement } from '@alkemio/excalidraw/dist/types/element/src/types';
import type { AppState, CollaboratorPointer, SocketId } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { DELETED_ELEMENT_TIMEOUT, WS_SCENE_EVENT_TYPES } from '../excalidrawAppConstants';
import { env } from '@/main/env';
import { BinaryFilesWithOptionalUrl } from '@/domain/common/whiteboard/excalidraw/types';
import type { MakeBrand } from '@alkemio/excalidraw/dist/types/common/src/utility-types';
import type { UserIdleState, isInvisiblySmallElement as ExcalidrawIsInvisiblySmallElement } from '@alkemio/excalidraw';
export type SyncableExcalidrawElement = OrderedExcalidrawElement & MakeBrand<'SyncableExcalidrawElement'>;

export const isSyncableElement = (
  element: OrderedExcalidrawElement,
  isInvisiblySmallElement: typeof ExcalidrawIsInvisiblySmallElement // isInvisiblySmallElement is a lazily loaded utility function, import it from '@alkemio/excalidraw/dist/excalidraw
): element is SyncableExcalidrawElement => {
  if (element.isDeleted) {
    return element.updated > Date.now() - DELETED_ELEMENT_TIMEOUT;
  }
  return !isInvisiblySmallElement(element);
};

/**
 * Right now the reason why we resolve connection params (url, polling...)
 * from upstream is to allow changing the params immediately when needed without
 * having to wait for clients to update the SW.
 *
 * If VITE_APP_ALKEMIO_DOMAIN env is set, we use that instead (useful for forks)
 */
export const getCollabServer = async (): Promise<{
  url: string;
  path: string;
  polling: boolean;
}> => {
  if (env?.VITE_APP_COLLAB_PATH && env?.VITE_APP_COLLAB_URL) {
    return {
      url: env.VITE_APP_COLLAB_URL,
      path: env.VITE_APP_COLLAB_PATH,
      polling: true,
    };
  }
  throw new Error('errors.cannotResolveCollabServer');
};

export type SocketUpdateDataSource = {
  SCENE_INIT: {
    type: 'SCENE_INIT';
    payload: {
      elements: readonly ExcalidrawElement[];
      files: BinaryFilesWithOptionalUrl;
    };
  };
  SCENE_UPDATE: {
    type: WS_SCENE_EVENT_TYPES.SCENE_UPDATE;
    payload: {
      elements: readonly ExcalidrawElement[];
      files: BinaryFilesWithOptionalUrl;
    };
  };
  MOUSE_LOCATION: {
    type: WS_SCENE_EVENT_TYPES.MOUSE_LOCATION;
    payload: {
      socketId: SocketId;
      pointer: CollaboratorPointer;
      button: 'down' | 'up';
      selectedElementIds: AppState['selectedElementIds'];
      username: string;
    };
  };
  IDLE_STATUS: {
    type: 'IDLE_STATUS';
    payload: {
      socketId: SocketId;
      userState: UserIdleState;
      username: string;
    };
  };
  INVALID_RESPONSE: {
    type: 'INVALID_RESPONSE';
    payload: never;
  };
  EMOJI_REACTION: {
    type: WS_SCENE_EVENT_TYPES.EMOJI_REACTION;
    payload: {
      emoji: string;
      x: number; // sceneX (whiteboard coordinates)
      y: number; // sceneY (whiteboard coordinates)
      id?: string;
    };
  };
};

export type SocketUpdateData = SocketUpdateDataSource[keyof SocketUpdateDataSource] & {
  _brand: 'socketUpdateData';
};
