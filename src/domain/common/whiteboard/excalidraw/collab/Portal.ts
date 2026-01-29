import { isSyncableElement, SocketUpdateData, SocketUpdateDataSource, SyncableExcalidrawElement } from './data';
import type { ExcalidrawElement, OrderedExcalidrawElement } from '@alkemio/excalidraw/dist/types/element/src/types';
import { UserIdleState } from './utils';
import type { DataURL, SocketId } from '@alkemio/excalidraw/dist/types/excalidraw/types';

import { CollaboratorModeEvent, WS_EVENTS, WS_SCENE_EVENT_TYPES } from './excalidrawAppConstants';
import { Socket } from 'socket.io-client';
import { BinaryFileDataWithOptionalUrl, BinaryFilesWithOptionalUrl } from '../types';
import { isFileRenderable, shouldStripDataUrlForBroadcast } from '../fileStore/fileAvailability';
import type { isInvisiblySmallElement as ExcalidrawIsInvisiblySmallElement } from '@alkemio/excalidraw/dist/types/element/src';
import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { GUEST_SHARE_PATH } from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';
import { validateGuestName } from '@/domain/collaboration/whiteboard/guestAccess/utils/guestNameValidator';
import { warn, TagCategoryValues } from '@/core/logging/sentry/log';

interface PortalProps {
  onRemoteSave: () => void;
  onCloseConnection: () => void;
  onRoomUserChange: (clients: SocketId[]) => void;
  getSceneElements: () => readonly ExcalidrawElement[];
  getFiles: () => Promise<BinaryFilesWithOptionalUrl>;
}

interface BroadcastOptions {
  volatile?: boolean;
}

interface BroadcastSceneOptions {
  syncAll?: boolean;
}

interface ConnectionOptions {
  url: string;
  path: string;
  roomId: string;
  polling?: boolean;
}

interface SocketEventHandlers {
  'client-broadcast': (encryptedData: ArrayBuffer) => void;
  'collaborator-mode': (event: CollaboratorModeEvent) => void;
  'scene-init': (payload: SocketUpdateDataSource['SCENE_INIT']['payload']) => void;
  'idle-state': (payload: SocketUpdateDataSource['IDLE_STATUS']['payload']) => void;
}

type ExcalidrawUtils = {
  isInvisiblySmallElement: typeof ExcalidrawIsInvisiblySmallElement;
};

class Portal {
  onRemoteSave: (error?: string) => void;
  onCloseConnection: () => void;
  onRoomUserChange: (clients: SocketId[]) => void;
  getSceneElements: () => readonly ExcalidrawElement[];
  getFiles: () => Promise<BinaryFilesWithOptionalUrl>;
  socket: Socket | null = null;
  sceneInitialized: boolean = false; // we don't want the socket to emit any updates until it is fully initialized
  roomId: string | null = null;
  broadcastedElementVersions: Map<string, number> = new Map();
  broadcastedFiles: Set<string> = new Set();
  excalidrawAPI: ExcalidrawUtils | undefined;

  constructor({ onRemoteSave, onRoomUserChange, getSceneElements, getFiles, onCloseConnection }: PortalProps) {
    this.onRemoteSave = onRemoteSave;
    this.onRoomUserChange = onRoomUserChange;
    this.getSceneElements = getSceneElements;
    this.getFiles = getFiles;
    this.onCloseConnection = onCloseConnection;
    this.excalidrawAPI = undefined;
  }

  open(connectionOptions: ConnectionOptions, eventHandlers: SocketEventHandlers) {
    if (this.socket) {
      throw new Error('Socket already open');
    }

    return new Promise(async (resolve, reject) => {
      const { default: socketIOClient } = await import('socket.io-client');

      // Prepare auth data for Socket.IO connection
      const auth: Record<string, string> = {};

      // Add guest name for public whiteboard routes
      if (globalThis.window?.location.pathname.startsWith(GUEST_SHARE_PATH)) {
        try {
          const guestName = globalThis.sessionStorage.getItem('alkemio_guest_name');
          if (guestName) {
            const validation = validateGuestName(guestName);
            if (validation.valid) {
              auth.guestName = guestName;
            }
          }
        } catch (error) {
          warn(`Failed to read guest name from session storage: ${error}`, { category: TagCategoryValues.WHITEBOARD });`
        }
      }

      const socket = socketIOClient(connectionOptions.url, {
        transports: connectionOptions.polling ? ['websocket', 'polling'] : ['websocket'],
        path: connectionOptions.path,
        retries: 0,
        reconnection: false,
        auth,
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

      this.socket.on('room-saved', () => this.onRemoteSave());
      this.socket.on('room-not-saved', ({ error }) => this.onRemoteSave(error));

      this.socket.on('collaborator-mode', eventHandlers['collaborator-mode']);

      this.socket.on('room-user-change', this.onRoomUserChange);

      this.socket.on('idle-state', (binaryData: ArrayBuffer) => {
        const strData = new TextDecoder().decode(binaryData);
        const data = JSON.parse(strData) as SocketUpdateDataSource['IDLE_STATUS'];
        eventHandlers['idle-state'](data.payload);
      });

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

      // Initialize excalidrawAPI, lazy load utility functions
      const { isInvisiblySmallElement } = await lazyImportWithErrorHandler<ExcalidrawUtils>(
        () => import('@alkemio/excalidraw')
      );
      this.excalidrawAPI = { isInvisiblySmallElement };
    });
  }

  close() {
    if (!this.socket) {
      return;
    }

    this.socket.close();
    this.socket = null;
    this.roomId = null;
    this.sceneInitialized = false;
    this.broadcastedElementVersions = new Map();
  }

  isOpen() {
    return !!(this.sceneInitialized && this.socket && this.roomId);
  }

  private _broadcastSocketData(data: SocketUpdateData, { volatile = false }: BroadcastOptions = {}) {
    return this._broadcastEvent(volatile ? WS_EVENTS.SERVER_VOLATILE : WS_EVENTS.SERVER, data);
  }

  private _broadcastEvent(eventName: (typeof WS_EVENTS)[keyof typeof WS_EVENTS], data: SocketUpdateData) {
    if (this.isOpen()) {
      const jsonStr = JSON.stringify(data);
      const buffer = new TextEncoder().encode(jsonStr).buffer;
      this.socket?.emit(eventName, this.roomId, buffer);
    }
  }

  broadcastScene = async (
    updateType: WS_SCENE_EVENT_TYPES.SCENE_UPDATE,
    allElements: readonly OrderedExcalidrawElement[],
    allFiles: BinaryFilesWithOptionalUrl,
    { syncAll = false }: BroadcastSceneOptions = {}
  ) => {
    if (!this.excalidrawAPI) {
      return;
    }
    const { isInvisiblySmallElement } = this.excalidrawAPI;

    // sync out only the elements we think we need to to save bandwidth.
    // periodically we'll resync the whole thing to make sure no one diverges
    // due to a dropped message (server goes down etc).
    const syncableElements = allElements.reduce((acc, element) => {
      if (
        (syncAll ||
          !this.broadcastedElementVersions.has(element.id) ||
          element.version > this.broadcastedElementVersions.get(element.id)!) &&
        isSyncableElement(element, isInvisiblySmallElement)
      ) {
        acc.push(element);
      }

      return acc;
    }, [] as SyncableExcalidrawElement[]);

    const emptyDataURL = '' as DataURL;
    const skippedFiles: string[] = [];
    const syncableFiles = Object.keys(allFiles).reduce<Record<string, BinaryFileDataWithOptionalUrl>>((result, fileId) => {
      const file = allFiles[fileId];
      // Skip files that have no usable retrieval path (neither url nor dataURL)
      if (!isFileRenderable(file)) {
        skippedFiles.push(fileId);
        return result;
      }
      if (syncAll || !this.broadcastedFiles.has(fileId)) {
        // Only strip dataURL when url is usable; otherwise peers need dataURL to render
        const dataURL = shouldStripDataUrlForBroadcast(file) ? emptyDataURL : file.dataURL;
        result[fileId] = { ...file, dataURL };
        this.broadcastedFiles.add(fileId);
      }
      return result;
    }, {});

    // Log diagnostic info if files were skipped due to lack of retrieval path (FR-007)
    if (skippedFiles.length > 0) {
      warn(
        `Broadcast skipped ${skippedFiles.length} files with no usable retrieval path: [${skippedFiles.join(', ')}]`,
        { category: TagCategoryValues.WHITEBOARD, label: 'broadcast-files-skipped' }
      );
    }

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
          socketId: this.socket.id as SocketId,
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
        type: WS_SCENE_EVENT_TYPES.MOUSE_LOCATION,
        payload: {
          socketId: this.socket.id as SocketId,
          ...payload,
        },
      };
      return this._broadcastEvent(WS_EVENTS.SERVER_VOLATILE, data as SocketUpdateData);
    }
  };
}

export default Portal;
