import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import { DELETED_ELEMENT_TIMEOUT, REACT_APP_PORTAL_URL, REACT_APP_WS_SERVER_URL, ROOM_ID_BYTES } from '../excalidrawAppConstants';
import { isInvisiblySmallElement } from '@alkemio/excalidraw';
import { AppState, UserIdleState } from '@alkemio/excalidraw/types/types';
import { bytesToHexString } from '../utils';

export type SyncableExcalidrawElement = ExcalidrawElement & {
  _brand: 'SyncableExcalidrawElement';
};

export const isSyncableElement = (
  element: ExcalidrawElement,
): element is SyncableExcalidrawElement => {
  if (element.isDeleted) {
    if (element.updated > Date.now() - DELETED_ELEMENT_TIMEOUT) {
      return true;
    }
    return false;
  }
  return !isInvisiblySmallElement(element);
};

export const getSyncableElements = (elements: readonly ExcalidrawElement[]) =>
  elements.filter((element) =>
    isSyncableElement(element),
  ) as SyncableExcalidrawElement[];

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
 * If REACT_APP_WS_SERVER_URL env is set, we use that instead (useful for forks)
 */
export const getCollabServer = async (): Promise<{
  url: string;
  polling: boolean;
}> => {
  if (REACT_APP_WS_SERVER_URL) {  //!! get from process.env
    return {
      url: REACT_APP_WS_SERVER_URL,
      polling: true,
    };
  }

  try {
    const resp = await fetch(
      `${REACT_APP_PORTAL_URL}/collab-server`,
    );
    return await resp.json();
  } catch (error) {
    console.error(error);
    throw new Error('errors.cannotResolveCollabServer');
  }
};

export type SocketUpdateDataSource = {
  SCENE_INIT: {
    type: 'SCENE_INIT';
    payload: {
      elements: readonly ExcalidrawElement[];
    };
  };
  SCENE_UPDATE: {
    type: 'SCENE_UPDATE';
    payload: {
      elements: readonly ExcalidrawElement[];
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
};

export type SocketUpdateData =
  SocketUpdateDataSource[keyof SocketUpdateDataSource] & {
    _brand: 'socketUpdateData';
  };

  const RE_COLLAB_LINK = /^#room=([a-zA-Z0-9_-]+)$/;

export const isCollaborationLink = (link: string) => {
  const hash = new URL(link).hash;
  return RE_COLLAB_LINK.test(hash);
};

export const generateCollaborationLinkData = async () => {
  const roomId = await generateRoomId();

  return { roomId };
};
