import { throttle } from 'lodash';
import type {
  Collaborator,
  ExcalidrawImperativeAPI,
  Gesture,
  SocketId,
} from '@alkemio/excalidraw/dist/excalidraw/types';
import type { ExcalidrawElement, OrderedExcalidrawElement } from '@alkemio/excalidraw/dist/excalidraw/element/types';
import {
  hashElementsVersion as ExcalidrawHashElementsVersion,
  reconcileElements as ExcalidrawReconcileElements,
  restoreElements as ExcalidrawRestoreElements,
  StoreAction as ExcalidrawStoreAction,
  newElementWith as ExcalidrawNewElementWith,
} from '@alkemio/excalidraw';
import {
  ACTIVE_THRESHOLD,
  CollaboratorModeEvent,
  CURSOR_SYNC_TIMEOUT,
  EVENT,
  IDLE_THRESHOLD,
  SYNC_FULL_SCENE_INTERVAL_MS,
  WS_SCENE_EVENT_TYPES,
} from './excalidrawAppConstants';
import { isImageElement, UserIdleState } from './utils';
import { getCollabServer, SocketUpdateDataSource } from './data';
import Portal from './Portal';
import { BinaryFilesWithUrl, WhiteboardFilesManager } from '../useWhiteboardFilesManager';
import { error as logError, TagCategoryValues } from '@/core/logging/sentry/log';
import {
  ReconciledExcalidrawElement,
  RemoteExcalidrawElement,
} from '@alkemio/excalidraw/dist/excalidraw/data/reconcile';
import type { Mutable } from '@alkemio/excalidraw/dist/excalidraw/utility-types';
import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';

type CollabState = {
  errorMessage: string;
  username: string;
  activeRoomLink: string;
};

export interface CollabProps {
  excalidrawApi: ExcalidrawImperativeAPI;
  username: string;
  onRemoteSave: () => void; // The client has received a room saved event
  filesManager: WhiteboardFilesManager;
  onCloseConnection: () => void;
  onCollaboratorModeChange: (event: CollaboratorModeEvent) => void;
  onSceneInitChange: (initialized: boolean) => void;
}

type IncomingClientBroadcastData = {
  type: WS_SCENE_EVENT_TYPES | 'INVALID_RESPONSE';
  payload: {
    [key: string]: unknown;
  };
};

// List of used functions from Excalidraw that will be lazy loaded
type ExcalidrawUtils = {
  hashElementsVersion: typeof ExcalidrawHashElementsVersion;
  reconcileElements: typeof ExcalidrawReconcileElements;
  restoreElements: typeof ExcalidrawRestoreElements;
  StoreAction: typeof ExcalidrawStoreAction;
  newElementWith: typeof ExcalidrawNewElementWith;
};

class Collab {
  portal: Portal;
  state: CollabState;
  excalidrawAPI: ExcalidrawImperativeAPI;
  filesManager: WhiteboardFilesManager;
  activeIntervalId: number | null = null;
  idleTimeoutId: number | null = null;

  private socketInitializationTimer?: number;
  private lastBroadcastedOrReceivedSceneVersion: number = -1;
  private collaborators = new Map<SocketId, Collaborator>();
  private onCloseConnection: () => void;
  private onCollaboratorModeChange: (event: CollaboratorModeEvent) => void;
  private onSceneInitChange: (initialized: boolean) => void;
  private excalidrawUtils: Promise<ExcalidrawUtils>;

  constructor(props: CollabProps) {
    this.state = {
      errorMessage: '',
      username: props.username,
      activeRoomLink: '',
    };
    this.portal = new Portal({
      onRemoteSave: props.onRemoteSave,
      onRoomUserChange: this.setCollaborators,
      getSceneElements: this.getSceneElementsIncludingDeleted,
      getFiles: this.getFiles,
      onCloseConnection: this.handleCloseConnection,
    });
    this.onCloseConnection = props.onCloseConnection;
    this.excalidrawAPI = props.excalidrawApi;
    this.filesManager = props.filesManager;
    this.onCollaboratorModeChange = props.onCollaboratorModeChange;
    this.onSceneInitChange = props.onSceneInitChange;
    this.excalidrawUtils = lazyImportWithErrorHandler<ExcalidrawUtils>(() => import('@alkemio/excalidraw'));
  }

  init() {
    window.addEventListener(EVENT.UNLOAD, this.onUnload);
  }

  destroy() {
    window.removeEventListener(EVENT.UNLOAD, this.onUnload);
    window.removeEventListener(EVENT.POINTER_MOVE, this.onPointerMove);
    window.removeEventListener(EVENT.VISIBILITY_CHANGE, this.onVisibilityChange);

    if (this.activeIntervalId) {
      window.clearInterval(this.activeIntervalId);
      this.activeIntervalId = null;
    }

    if (this.idleTimeoutId) {
      window.clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = null;
    }
  }

  private onUnload = () => {
    this.destroySocketClient({ isUnload: true });
  };

  private handleCloseConnection = () => {
    this.setCollaborators([]);
    this.onCloseConnection();
    this.portal.socketInitialized = false;
    this.onSceneInitChange(false);
  };

  stopCollaboration = async () => {
    const { StoreAction, newElementWith } = await this.excalidrawUtils;

    this.queueBroadcastAllElements.cancel();
    this.destroySocketClient();

    const elements = this.excalidrawAPI.getSceneElementsIncludingDeleted().map(element => {
      if (isImageElement(element) && element.status === 'saved') {
        return newElementWith(element, { status: 'pending' });
      }
      return element;
    });

    this.excalidrawAPI.updateScene({
      elements,
      storeAction: StoreAction.NONE,
    });
  };

  public isCollaborating = () => {
    return this.portal.isOpen();
  };

  private destroySocketClient = (opts?: { isUnload: boolean }) => {
    this.lastBroadcastedOrReceivedSceneVersion = -1;
    this.portal.close();

    if (!opts?.isUnload) {
      this.state.activeRoomLink = '';
      this.collaborators = new Map();
      this.excalidrawAPI.updateScene({
        collaborators: this.collaborators,
      });
    }
  };

  startCollaboration = async (existingRoomLinkData: { roomId: string }): Promise<void> =>
    new Promise(async (resolve, reject) => {
      const { roomId } = existingRoomLinkData;

      try {
        const socketServerData = await getCollabServer();

        await this.portal.open(
          {
            ...socketServerData,
            roomId,
          },
          {
            'scene-init': async (payload: { elements: readonly ExcalidrawElement[]; files: BinaryFilesWithUrl }) => {
              if (!this.portal.socketInitialized) {
                this.initializeRoom({ fetchScene: false });
                await this.handleRemoteSceneUpdate(
                  await this.reconcileElementsAndLoadFiles(payload.elements, payload.files),
                  {
                    init: true,
                  }
                );
                const convertedFilesWithUrl = await this.filesManager.loadAndTryConvertEmbeddedFiles(payload.files);
                // broadcast only the converted files
                if (Object.entries(convertedFilesWithUrl).length) {
                  await this.portal.broadcastScene(WS_SCENE_EVENT_TYPES.SCENE_UPDATE, [], convertedFilesWithUrl);
                }
                this.excalidrawAPI.zoomToFit();
                this.onSceneInitChange(true);
              }
            },
            'client-broadcast': async (binaryData: ArrayBuffer) => {
              const strData = new TextDecoder().decode(binaryData);
              let data: IncomingClientBroadcastData | undefined;

              try {
                data = JSON.parse(strData) as IncomingClientBroadcastData;
              } catch (e) {
                logError('Unable to parse incoming broadcast');
                return;
              }

              if (isInvalidResponsePayload(data)) {
                return;
              } else if (isMouseLocationPayload(data)) {
                const { pointer, button, username, selectedElementIds } = data.payload;
                const socketId: SocketUpdateDataSource['MOUSE_LOCATION']['payload']['socketId'] = data.payload.socketId;

                this.updateCollaborator(socketId, {
                  pointer,
                  button,
                  selectedElementIds,
                  username,
                });
              } else if (isSceneUpdatePayload(data)) {
                const remoteElements = data.payload.elements as RemoteExcalidrawElement[];
                const remoteFiles = data.payload.files;
                await this.handleRemoteSceneUpdate(
                  await this.reconcileElementsAndLoadFiles(remoteElements, remoteFiles)
                );
              }
            },
            'collaborator-mode': event => {
              resolve();
              this.onCollaboratorModeChange(event);
            },
            'idle-state': ({ userState, socketId, username }) => {
              this.updateCollaborator(socketId, {
                userState,
                username,
              });
            },
          }
        );
      } catch (error) {
        const err = error as Error;
        // eslint-disable-next-line no-console
        logError(err?.message ?? JSON.stringify(err), {
          category: TagCategoryValues.WHITEBOARD,
          label: 'Collab',
        });
        this.state.errorMessage = (error as { message: string } | undefined)?.message ?? '';
        reject(error);
      }

      this.initializeIdleDetector();

      this.state.activeRoomLink = window.location.href;
    });

  private updateCollaborator = (socketId: SocketId, updates: Partial<Collaborator>) => {
    const collaborators = new Map(this.collaborators);
    const user: Mutable<Collaborator> = Object.assign({}, collaborators.get(socketId), updates, {
      isCurrentUser: socketId === this.portal.socket?.id,
    });
    collaborators.set(socketId, user);
    this.collaborators = collaborators;

    this.excalidrawAPI.updateScene({
      collaborators,
    });
  };

  private initializeRoom = ({
    fetchScene,
    roomLinkData,
  }:
    | {
        fetchScene: true;
        roomLinkData: { roomId: string } | null;
      }
    | { fetchScene: false; roomLinkData?: null }) => {
    clearTimeout(this.socketInitializationTimer!);

    if (fetchScene && roomLinkData) {
      try {
        this.queueBroadcastAllElements();
      } catch (error: unknown) {
        const err = error as Error;
        // log the error and move on. other peers will sync us the scene.
        // eslint-disable-next-line no-console
        logError(err?.message ?? JSON.stringify(err), {
          category: TagCategoryValues.WHITEBOARD,
          label: 'Collab',
        });
      } finally {
        this.portal.socketInitialized = true;
      }
    } else {
      this.portal.socketInitialized = true;
    }
  };

  private reconcileElementsAndLoadFiles = async (
    remoteElements: readonly ExcalidrawElement[],
    remoteFiles: BinaryFilesWithUrl
  ): Promise<ReconciledExcalidrawElement[]> => {
    const localElements = this.getSceneElementsIncludingDeleted();
    const appState = this.excalidrawAPI.getAppState();

    const { restoreElements, hashElementsVersion, reconcileElements } = await this.excalidrawUtils;

    const restoredRemoteElements = restoreElements(remoteElements, null);

    const reconciledElements = reconcileElements(
      localElements,
      restoredRemoteElements as RemoteExcalidrawElement[],
      appState
    );
    // Avoid broadcasting to the rest of the collaborators the scene
    // we just received!
    // Note: this needs to be set before updating the scene as it
    // synchronously calls render.
    this.lastBroadcastedOrReceivedSceneVersion = hashElementsVersion(reconciledElements);

    // Download the files that this instance is missing:
    return this.filesManager.loadFiles({ files: remoteFiles }).then(() => {
      // once the files are loaded, we need to update the scene again to render them
      // instead of updating the scene twice, which is already expensive, we
      // return the elements once the files have been loaded
      // that way we render the elements and images at the same time
      return reconciledElements;
    });
  };

  private handleRemoteSceneUpdate = async (
    elements: ReconciledExcalidrawElement[],
    { init = false }: { init?: boolean } = {}
  ) => {
    const { StoreAction } = await this.excalidrawUtils;

    this.excalidrawAPI.updateScene({
      elements,
      storeAction: init ? StoreAction.CAPTURE : StoreAction.NONE,
    });

    this.filesManager.pushFilesToExcalidraw();

    // We haven't yet implemented multiplayer undo functionality, so we clear the undo stack
    // when we receive any messages from another peer. This UX can be pretty rough -- if you
    // undo, a user makes a change, and then try to redo, your element(s) will be lost. However,
    // right now we think this is the right tradeoff.
    this.excalidrawAPI.history.clear();
  };

  private onPointerMove = () => {
    if (this.idleTimeoutId) {
      window.clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = null;
    }

    this.idleTimeoutId = window.setTimeout(this.reportIdle, IDLE_THRESHOLD);

    if (!this.activeIntervalId) {
      this.activeIntervalId = window.setInterval(this.reportActive, ACTIVE_THRESHOLD);
    }
  };

  private onVisibilityChange = () => {
    if (document.hidden) {
      if (this.idleTimeoutId) {
        window.clearTimeout(this.idleTimeoutId);
        this.idleTimeoutId = null;
      }

      if (this.activeIntervalId) {
        window.clearInterval(this.activeIntervalId);
        this.activeIntervalId = null;
      }

      this.onIdleStateChange(UserIdleState.AWAY);
    } else {
      this.idleTimeoutId = window.setTimeout(this.reportIdle, IDLE_THRESHOLD);
      this.activeIntervalId = window.setInterval(this.reportActive, ACTIVE_THRESHOLD);
      this.onIdleStateChange(UserIdleState.ACTIVE);
    }
  };

  private reportIdle = () => {
    this.onIdleStateChange(UserIdleState.IDLE);

    if (this.activeIntervalId) {
      window.clearInterval(this.activeIntervalId);
      this.activeIntervalId = null;
    }
  };

  private reportActive = () => {
    this.onIdleStateChange(UserIdleState.ACTIVE);
  };

  private initializeIdleDetector = () => {
    document.addEventListener(EVENT.POINTER_MOVE, this.onPointerMove);
    document.addEventListener(EVENT.VISIBILITY_CHANGE, this.onVisibilityChange);
  };

  private setCollaborators = (sockets: SocketId[]) => {
    const collaborators = new Map<SocketId, Collaborator>();

    for (const socketId of sockets) {
      if (this.collaborators.has(socketId)) {
        collaborators.set(socketId, this.collaborators.get(socketId)!);
      } else {
        collaborators.set(socketId, {});
      }
    }

    this.collaborators = collaborators;
    this.excalidrawAPI.updateScene({ collaborators });
  };

  private getSceneElementsIncludingDeleted = () => {
    return this.excalidrawAPI.getSceneElementsIncludingDeleted();
  };

  private getFiles = () => {
    return this.filesManager.getUploadedFiles(this.excalidrawAPI.getFiles());
  };

  public onPointerUpdate = throttle(
    (payload: {
      pointer: SocketUpdateDataSource['MOUSE_LOCATION']['payload']['pointer'];
      button: SocketUpdateDataSource['MOUSE_LOCATION']['payload']['button'];
      pointersMap: Gesture['pointers'];
    }) => {
      payload.pointersMap.size < 2 &&
        this.portal.socket &&
        this.portal.broadcastMouseLocation({
          ...payload,
          username: this.state.username,
          selectedElementIds: this.excalidrawAPI.getAppState().selectedElementIds,
        });
    },
    CURSOR_SYNC_TIMEOUT
  );

  private onIdleStateChange = (userState: UserIdleState) => {
    this.portal.broadcastIdleChange(userState, this.state.username);
  };

  public syncScene = async (elements: readonly OrderedExcalidrawElement[], files: BinaryFilesWithUrl) => {
    const { hashElementsVersion } = await this.excalidrawUtils;
    const newVersion = hashElementsVersion(elements);

    if (newVersion !== this.lastBroadcastedOrReceivedSceneVersion) {
      this.portal.broadcastScene(WS_SCENE_EVENT_TYPES.SCENE_UPDATE, elements, files, { syncAll: false });
      this.lastBroadcastedOrReceivedSceneVersion = newVersion;
      this.queueBroadcastAllElements();
    }
  };

  private queueBroadcastAllElements = throttle(async () => {
    const { hashElementsVersion } = await this.excalidrawUtils;
    const elements = this.excalidrawAPI.getSceneElementsIncludingDeleted();
    const files = await this.filesManager.getUploadedFiles(this.excalidrawAPI.getFiles());
    this.portal.broadcastScene(WS_SCENE_EVENT_TYPES.SCENE_UPDATE, elements, files, { syncAll: true });
    this.lastBroadcastedOrReceivedSceneVersion = hashElementsVersion(this.getSceneElementsIncludingDeleted());
  }, SYNC_FULL_SCENE_INTERVAL_MS);
}

export default Collab;

const isInvalidResponsePayload = (
  data: IncomingClientBroadcastData
): data is SocketUpdateDataSource['INVALID_RESPONSE'] => data.type === 'INVALID_RESPONSE';
const isMouseLocationPayload = (data: IncomingClientBroadcastData): data is SocketUpdateDataSource['MOUSE_LOCATION'] =>
  data.type === WS_SCENE_EVENT_TYPES.MOUSE_LOCATION;
const isSceneUpdatePayload = (data: IncomingClientBroadcastData): data is SocketUpdateDataSource['SCENE_UPDATE'] =>
  data.type === WS_SCENE_EVENT_TYPES.SCENE_UPDATE;
