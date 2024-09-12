import { IsSyncableElement, SocketUpdateData, SocketUpdateDataSource } from './data';
import type { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import type { DataURL } from '@alkemio/excalidraw/types/types';
import {
  CollaboratorModeEvent,
  PRECEDING_ELEMENT_KEY,
  WS_EVENTS,
  WS_SCENE_EVENT_TYPES,
} from './excalidrawAppConstants';
import { UserIdleState } from './utils';
import { BroadcastedExcalidrawElement } from './reconciliation';
import { Socket } from 'socket.io-client';
import { BinaryFileDataWithUrl, BinaryFilesWithUrl } from '../useWhiteboardFilesManager';

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

interface ConnectionOptions {
  url: string;
  roomId: string;
  polling?: boolean;
}

interface SocketEventHandlers {
  'client-broadcast': (encryptedData: ArrayBuffer) => void;
  'first-in-room': () => void;
  'collaborator-mode': (event: CollaboratorModeEvent) => void;
  'scene-init': (data: SocketUpdateDataSource['SCENE_INIT']['payload']) => void;
  saved: () => void;
  'idle-state': (payload: SocketUpdateDataSource['IDLE_STATUS']['payload']) => void;
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

  open(connectionOptions: ConnectionOptions, eventHandlers: SocketEventHandlers) {
    if (this.socket) {
      throw new Error('Socket already open');
    }

    return new Promise(async (resolve, reject) => {
      const { default: socketIOClient } = await import('socket.io-client');

      const socket = socketIOClient('localhost:4002' /*connectionOptions.url*/, {
        transports: connectionOptions.polling ? ['websocket', 'polling'] : ['websocket'],
        // path: '/api/private/ws/socket.io',
        path: '/socket.io',
        retries: 0,
        reconnection: false,
      });

      this.socket = socket;
      this.roomId = connectionOptions.roomId;

      // Initialize socket listeners
      this.socket.on('init-room', () => {
        if (this.socket) {
          this.socket.emit('join-room', this.roomId);
        }
      });

      this.socket.on('scene-init', (data: ArrayBuffer) => {
        const decodedData = new TextDecoder().decode(data);
        const parsedData = JSON.parse(decodedData);
        eventHandlers['scene-init'](parsedData.payload);
      });

      this.socket.on('first-in-room', () => {
        socket.off('first-in-room');
        eventHandlers['first-in-room']();
      });

      this.socket.on('collaborator-mode', eventHandlers['collaborator-mode']);

      // this.socket.on('new-user', async (_socketId: string) => {
      //   this.broadcastScene(WS_SCENE_EVENT_TYPES.INIT, this.getSceneElements(), await this.getFiles(), {
      //     syncAll: true,
      //   });
      // });

      // setInterval(async () => {
      //   return this._broadcastEvent(WS_EVENTS.SERVER, {
      //     type: 'sync-check',
      //     payload: {
      //       elements: this.getSceneElements(),
      //     },
      //   } as never);
      // }, 10000);

      this.socket.on('room-user-change', (clients: string[]) => {
        this.onRoomUserChange(clients);
      });

      this.socket.on('idle-state', (encryptedData: ArrayBuffer) => {
        const decodedData = new TextDecoder().decode(encryptedData);
        const decryptedData = JSON.parse(decodedData);
        eventHandlers['idle-state'](decryptedData.payload);
      });

      this.socket.on('save-request', async callback => {
        try {
          callback(await this.onSaveRequest());
        } catch (ex) {
          callback({ success: false, errors: [(ex as { message?: string })?.message ?? ex] });
        }
      });

      this.socket.on('saved', eventHandlers.saved);

      this.socket.on('client-broadcast', eventHandlers['client-broadcast']);

      this.socket.on('connect', () => {
        resolve(socket);
      });

      this.socket.on('connect_error', () => {
        reject(new Error('Socket could not connect'));
        this.close();
        this.onCloseConnection();
      });

      this.socket.on('disconnect', reason => {
        if (reason === 'io client disconnect') {
          // disconnected intentionally
          return;
        }
        reject(new Error('Socket disconnected'));
        this.close();
        this.onCloseConnection();
      });
    });
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
    return this._broadcastEvent(volatile ? WS_EVENTS.SERVER_VOLATILE : WS_EVENTS.SERVER, data);
  }

  private _broadcastEvent(eventName: typeof WS_EVENTS[keyof typeof WS_EVENTS], data: SocketUpdateData) {
    if (this.isOpen()) {
      const jsonStr = JSON.stringify(data);
      const buffer = new TextEncoder().encode(jsonStr).buffer;
      this.socket?.emit(eventName, this.roomId, buffer);
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

    const { isInvisiblySmallElement } = await import('@alkemio/excalidraw');

    const isSyncableElement = IsSyncableElement({ isInvisiblySmallElement });

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

    if (updateType === WS_SCENE_EVENT_TYPES.INIT) {
      return this._broadcastEvent(WS_EVENTS.SCENE_INIT, data as SocketUpdateData);
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
      return this._broadcastEvent(WS_EVENTS.IDLE_STATE, data as SocketUpdateData);
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
      return this._broadcastEvent(WS_EVENTS.SERVER_VOLATILE, data as SocketUpdateData);
    }
  };
}

export default Portal;
