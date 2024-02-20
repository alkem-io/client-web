import { isSyncableElement, SocketUpdateData, SocketUpdateDataSource } from './data';
import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import { PRECEDING_ELEMENT_KEY, WS_EVENTS, WS_SCENE_EVENT_TYPES } from './excalidrawAppConstants';
import { UserIdleState } from './utils';
import { BroadcastedExcalidrawElement } from './reconciliation';
import { Socket } from 'socket.io-client';
import { BinaryFileDataWithUrl, BinaryFilesWithUrl } from '../useWhiteboardFilesManager';
import { DataURL } from '@alkemio/excalidraw/types/types';

interface PortalProps {
  onSaveRequest: () => Promise<{ success: boolean; errors?: string[] }>;
  onCloseConnection: () => void;
  onRoomUserChange: (clients: string[]) => void;
  getSceneElements: () => readonly ExcalidrawElement[];
  getFiles: () => Promise<BinaryFilesWithUrl>;
}

interface BroadcastOptions {
  volatile?: boolean;
}

interface BroadcastSceneOptions {
  syncAll?: boolean;
}

class Portal {
  onSaveRequest: () => Promise<{ success: boolean; errors?: string[] }>;
  onCloseConnection: () => void;
  onRoomUserChange: (clients: string[]) => void;
  getSceneElements: () => readonly ExcalidrawElement[];
  getFiles: () => Promise<BinaryFilesWithUrl>;
  socket: Socket | null = null;
  socketInitialized: boolean = false; // we don't want the socket to emit any updates until it is fully initialized
  roomId: string | null = null;
  broadcastedElementVersions: Map<string, number> = new Map();
  broadcastedFiles: Set<string> = new Set();

  constructor({ onSaveRequest, onRoomUserChange, getSceneElements, getFiles, onCloseConnection }: PortalProps) {
    this.onSaveRequest = onSaveRequest;
    this.onRoomUserChange = onRoomUserChange;
    this.getSceneElements = getSceneElements;
    this.getFiles = getFiles;
    this.onCloseConnection = onCloseConnection;
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
      this.broadcastScene(WS_SCENE_EVENT_TYPES.INIT, this.getSceneElements(), await this.getFiles(), { syncAll: true });
    });

    this.socket.on('room-user-change', (clients: string[]) => {
      this.onRoomUserChange(clients);
    });

    this.socket.on('save-request', async callback => {
      try {
        callback(await this.onSaveRequest());
      } catch (ex) {
        callback({ success: false, errors: [(ex as { message?: string })?.message ?? ex] });
      }
    });

    this.socket.on('disconnect', () => {
      this.close();
      this.onCloseConnection();
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

  private _broadcastSocketData(data: SocketUpdateData, { volatile = false }: BroadcastOptions = {}) {
    if (this.isOpen()) {
      const jsonStr = JSON.stringify(data);
      const encryptedBuffer = new TextEncoder().encode(jsonStr).buffer;
      this.socket?.emit(volatile ? WS_EVENTS.SERVER_VOLATILE : WS_EVENTS.SERVER, this.roomId, encryptedBuffer);
    }
  }

  private _broadcastRequestData(data: SocketUpdateData) {
    if (this.isOpen()) {
      const jsonStr = JSON.stringify(data);
      const buffer = new TextEncoder().encode(jsonStr).buffer;
      this.socket?.emit(WS_EVENTS.SERVER_REQUEST_BROADCAST, this.roomId, buffer);
    }
  }

  broadcastScene = async (
    updateType: WS_SCENE_EVENT_TYPES.INIT | WS_SCENE_EVENT_TYPES.SCENE_UPDATE,
    allElements: readonly ExcalidrawElement[],
    allFiles: BinaryFilesWithUrl,
    { syncAll = false }: BroadcastSceneOptions = {}
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

    const emptyDataURL = '' as DataURL;
    const syncableFiles = Object.keys(allFiles).reduce<Record<string, BinaryFileDataWithUrl>>((result, fileId) => {
      if (syncAll || !this.broadcastedFiles.has(fileId)) {
        const file = { ...allFiles[fileId], dataURL: emptyDataURL };
        result[fileId] = file;
        this.broadcastedFiles.add(fileId);
      }
      return result;
    }, {});

    const data: SocketUpdateDataSource[typeof updateType] = {
      type: updateType,
      payload: {
        elements: syncableElements,
        files: syncableFiles,
      },
    };

    for (const syncableElement of syncableElements) {
      this.broadcastedElementVersions.set(syncableElement.id, syncableElement.version);
    }

    this._broadcastSocketData(data as SocketUpdateData);
  };

  broadcastIdleChange = (userState: UserIdleState, username: string) => {
    if (this.socket?.id) {
      const data: SocketUpdateDataSource['IDLE_STATUS'] = {
        type: 'IDLE_STATUS',
        payload: {
          socketId: this.socket.id,
          userState,
          username,
        },
      };
      return this._broadcastSocketData(data as SocketUpdateData, { volatile: true });
    }
  };

  broadcastMouseLocation = (payload: {
    pointer: SocketUpdateDataSource['MOUSE_LOCATION']['payload']['pointer'];
    button: SocketUpdateDataSource['MOUSE_LOCATION']['payload']['button'];
    selectedElementIds: Readonly<{
      [id: string]: true;
    }>;
    username: string;
  }) => {
    if (this.socket?.id) {
      const data: SocketUpdateDataSource['MOUSE_LOCATION'] = {
        type: 'MOUSE_LOCATION',
        payload: {
          socketId: this.socket.id,
          ...payload,
        },
      };
      return this._broadcastSocketData(data as SocketUpdateData, { volatile: true });
    }
  };

  broadcastSavedEvent = (username: string) => {
    if (this.socket?.id) {
      const data: SocketUpdateDataSource['SAVED'] = {
        type: 'SAVED',
        payload: {
          socketId: this.socket.id,
          username,
        },
      };
      return this._broadcastSocketData(data as SocketUpdateData);
    }
  };
}

export default Portal;
