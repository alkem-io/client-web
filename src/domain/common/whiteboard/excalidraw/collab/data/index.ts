import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import { DELETED_ELEMENT_TIMEOUT, ROOM_ID_BYTES } from '../excalidrawAppConstants';
import { isInvisiblySmallElement } from '@alkemio/excalidraw';
import { AppState, UserIdleState } from '@alkemio/excalidraw/types/types';
import { bytesToHexString } from '../utils';
import { env } from '../../../../../../main/env';
import { BinaryFilesWithUrl } from '../../useWhiteboardFilesManager';

export type SyncableExcalidrawElement = ExcalidrawElement & {
  _brand: 'SyncableExcalidrawElement';
};

export const isSyncableElement = (element: ExcalidrawElement): element is SyncableExcalidrawElement => {
  if (element.isDeleted) {
    return element.updated > Date.now() - DELETED_ELEMENT_TIMEOUT;
  }
  return !isInvisiblySmallElement(element);
};

const generateRoomId = async () => {
  const buffer = new Uint8Array(ROOM_ID_BYTES);
  window.crypto.getRandomValues(buffer);
  return bytesToHexString(buffer);
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
  polling: boolean;
}> => {
  if (env?.VITE_APP_ALKEMIO_DOMAIN) {
    return {
      url: env.VITE_APP_ALKEMIO_DOMAIN,
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
      files: BinaryFilesWithUrl;
    };
  };
  SCENE_UPDATE: {
    type: 'SCENE_UPDATE';
    payload: {
      elements: readonly ExcalidrawElement[];
      files: BinaryFilesWithUrl;
    };
  };
  MOUSE_LOCATION: {
    type: 'MOUSE_LOCATION';
    payload: {
      socketId: string;
      pointer: { x: number; y: number };
      button: 'down' | 'up';
      selectedElementIds: AppState['selectedElementIds'];
      username: string;
    };
  };
  IDLE_STATUS: {
    type: 'IDLE_STATUS';
    payload: {
      socketId: string;
      userState: UserIdleState;
      username: string;
    };
  };
  SAVED: {
    type: 'SAVED';
    payload: {
      socketId: string;
      username: string;
    };
  };
};

export type SocketUpdateData = SocketUpdateDataSource[keyof SocketUpdateDataSource] & {
  _brand: 'socketUpdateData';
};

export const generateCollaborationLinkData = async () => {
  const roomId = await generateRoomId();

  return { roomId };
};
