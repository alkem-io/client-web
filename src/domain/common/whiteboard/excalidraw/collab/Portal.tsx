import { isSyncableElement, SocketUpdateData, SocketUpdateDataSource } from './data';
import { TCollabClass } from './Collab';
import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import { WS_EVENTS, WS_SCENE_EVENT_TYPES, PRECEDING_ELEMENT_KEY } from './excalidrawAppConstants';
import { UserIdleState } from './utils';
import { BroadcastedExcalidrawElement } from './reconciliation';
import { Socket } from 'socket.io-client';
import { BinaryFileDataWithUrl, WhiteboardFilesManager } from '../useWhiteboardFilesManager';

interface PortalProps {
  collab: TCollabClass;
  filesManager: WhiteboardFilesManager;
  onSaveRequest: () => Promise<{ success: boolean; errors?: string[] }>;
}
class Portal {
  collab: TCollabClass;
  filesManager: WhiteboardFilesManager;
  onSaveRequest: () => Promise<{ success: boolean; errors?: string[] }>;
  socket: Socket | null = null;
  socketInitialized: boolean = false; // we don't want the socket to emit any updates until it is fully initialized
  roomId: string | null = null;
  broadcastedElementVersions: Map<string, number> = new Map();

  constructor({ collab, filesManager, onSaveRequest }: PortalProps) {
    this.collab = collab;
    this.filesManager = filesManager;
    this.onSaveRequest = onSaveRequest;
  }

  open(socket: Socket, id: string) {
    this.socket = socket;
    this.roomId = id;

    // Initialize socket listeners
    this.socket.on('init-room', () => {
      if (this.socket) {
        this.socket.emit('join-room', this.roomId);
      }
    });
    this.socket.on('new-user', async (_socketId: string) => {
      this.broadcastScene(
        WS_SCENE_EVENT_TYPES.INIT,
        this.collab.getSceneElementsIncludingDeleted(),
        /* syncAll */ true
      );
    });
    this.socket.on('room-user-change', (clients: string[]) => {
      this.collab.setCollaborators(clients);
    });

    this.socket.on('save-request', async callback => {
      try {
        callback(await this.onSaveRequest());
      } catch (ex) {
        callback({ success: false, errors: [ex?.message ?? ex] });
      }
    });

    return socket;
  }

  close() {
    if (!this.socket) {
      return;
    }
    this.socket.close();
    this.socket = null;
    this.roomId = null;
    this.socketInitialized = false;
    this.broadcastedElementVersions = new Map();
  }

  isOpen() {
    return !!(this.socketInitialized && this.socket && this.roomId);
  }

  async _broadcastSocketData(data: SocketUpdateData, volatile: boolean = false) {
    if (this.isOpen()) {
      const jsonStr = JSON.stringify(data);
      const encryptedBuffer = new TextEncoder().encode(jsonStr).buffer;

      this.socket?.emit(volatile ? WS_EVENTS.SERVER_VOLATILE : WS_EVENTS.SERVER, this.roomId, encryptedBuffer);
    }
  }

  broadcastScene = async (
    updateType: WS_SCENE_EVENT_TYPES.INIT | WS_SCENE_EVENT_TYPES.UPDATE,
    allElements: readonly ExcalidrawElement[],
    syncAll: boolean
  ) => {
    if (updateType === WS_SCENE_EVENT_TYPES.INIT && !syncAll) {
      throw new Error('syncAll must be true when sending SCENE.INIT');
    }

    // sync out only the elements we think we need to to save bandwidth.
    // periodically we'll resync the whole thing to make sure no one diverges
    // due to a dropped message (server goes down etc).
    const syncableElements = allElements.reduce((acc, element: BroadcastedExcalidrawElement, idx, elements) => {
      if (
        (syncAll ||
          !this.broadcastedElementVersions.has(element.id) ||
          element.version > this.broadcastedElementVersions.get(element.id)!) &&
        isSyncableElement(element)
      ) {
        acc.push({
          ...element,
          // z-index info for the reconciler
          [PRECEDING_ELEMENT_KEY]: idx === 0 ? '^' : elements[idx - 1]?.id,
        });
      }
      return acc;
    }, [] as BroadcastedExcalidrawElement[]);

    const data: SocketUpdateDataSource[typeof updateType] = {
      type: updateType,
      payload: {
        elements: syncableElements,
      },
    };

    for (const syncableElement of syncableElements) {
      this.broadcastedElementVersions.set(syncableElement.id, syncableElement.version);
    }

    await this._broadcastSocketData(data as SocketUpdateData);
  };

  broadcastFile = async (file: BinaryFileDataWithUrl) => {
    if (this.socket?.id) {
      const fileWithUrl = await this.filesManager.removeExcalidrawAttachment(file);
      if (fileWithUrl) {
        const data: SocketUpdateDataSource['FILE_UPLOAD'] = {
          type: 'FILE_UPLOAD',
          payload: {
            socketId: this.socket.id,
            file: fileWithUrl,
          },
        };

        await this._broadcastSocketData(data as SocketUpdateData);
      }
    }
  };

  broadcastFileRequest = async (fileIds: string[]) => {
    if (this.socket?.id) {
      const data: SocketUpdateDataSource['FILE_REQUEST'] = {
        type: 'FILE_REQUEST',
        payload: {
          socketId: this.socket.id,
          fileIds,
        },
      };

      await this._broadcastSocketData(data as SocketUpdateData);
    }
  };

  broadcastIdleChange = (userState: UserIdleState) => {
    if (this.socket?.id) {
      const data: SocketUpdateDataSource['IDLE_STATUS'] = {
        type: 'IDLE_STATUS',
        payload: {
          socketId: this.socket.id,
          userState,
          username: this.collab.state.username,
        },
      };
      return this._broadcastSocketData(
        data as SocketUpdateData,
        true // volatile
      );
    }
  };

  broadcastMouseLocation = (payload: {
    pointer: SocketUpdateDataSource['MOUSE_LOCATION']['payload']['pointer'];
    button: SocketUpdateDataSource['MOUSE_LOCATION']['payload']['button'];
  }) => {
    if (this.socket?.id) {
      const data: SocketUpdateDataSource['MOUSE_LOCATION'] = {
        type: 'MOUSE_LOCATION',
        payload: {
          socketId: this.socket.id,
          pointer: payload.pointer,
          button: payload.button || 'up',
          selectedElementIds: this.collab.excalidrawAPI.getAppState().selectedElementIds,
          username: this.collab.state.username,
        },
      };
      return this._broadcastSocketData(
        data as SocketUpdateData,
        true // volatile
      );
    }
  };

  broadcastSavedEvent = () => {
    if (this.socket?.id) {
      const data: SocketUpdateDataSource['SAVED'] = {
        type: 'SAVED',
        payload: {
          socketId: this.socket.id,
          username: this.collab.state.username,
        },
      };
      return this._broadcastSocketData(
        data as SocketUpdateData,
        false // volatile
      );
    }
  };
}

export default Portal;
