import { throttle } from 'lodash';
import { Collaborator, ExcalidrawImperativeAPI, Gesture } from '@alkemio/excalidraw/types/types';
import {
  ACTIVE_THRESHOLD,
  CollaboratorModeEvent,
  CURSOR_SYNC_TIMEOUT,
  EVENT,
  IDLE_THRESHOLD,
  SYNC_FULL_SCENE_INTERVAL_MS,
  WS_SCENE_EVENT_TYPES,
} from './excalidrawAppConstants';
import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import { getSceneVersion, newElementWith, restoreElements } from '@alkemio/excalidraw';
import { isImageElement, UserIdleState } from './utils';
import { getCollabServer, SocketUpdateDataSource } from './data';
import Portal from './Portal';
import { ReconciledElements, reconcileElements as _reconcileElements } from './reconciliation';
import { BinaryFilesWithUrl, WhiteboardFilesManager } from '../useWhiteboardFilesManager';

interface CollabState {
  errorMessage: string;
  username: string;
  activeRoomLink: string;
}

export interface CollabProps {
  excalidrawApi: ExcalidrawImperativeAPI;
  username: string;
  onSavedToDatabase?: () => void; // Someone in your room saved the whiteboard to the database
  filesManager: WhiteboardFilesManager;
  onSaveRequest: () => Promise<{ success: boolean; errors?: string[] }>;
  onCloseConnection: () => void;
  onCollaboratorModeChange: (event: CollaboratorModeEvent) => void;
}

class Collab {
  portal: Portal;
  state: CollabState;
  excalidrawAPI: ExcalidrawImperativeAPI;
  filesManager: WhiteboardFilesManager;
  activeIntervalId: number | null = null;
  idleTimeoutId: number | null = null;

  private socketInitializationTimer?: number;
  private lastBroadcastedOrReceivedSceneVersion: number = -1;
  private collaborators = new Map<string, Collaborator>();
  private onSavedToDatabase: (() => void) | undefined;
  private onCloseConnection: () => void;
  private onCollaboratorModeChange: (event: CollaboratorModeEvent) => void;

  constructor(props: CollabProps) {
    this.state = {
      errorMessage: '',
      username: props.username,
      activeRoomLink: '',
    };
    this.portal = new Portal({
      onSaveRequest: props.onSaveRequest,
      onRoomUserChange: this.setCollaborators,
      getSceneElements: this.getSceneElementsIncludingDeleted,
      getFiles: this.getFiles,
      onCloseConnection: this.handleCloseConnection,
    });
    this.onCloseConnection = props.onCloseConnection;
    this.excalidrawAPI = props.excalidrawApi;
    this.filesManager = props.filesManager;
    this.onSavedToDatabase = props.onSavedToDatabase;
    this.onCollaboratorModeChange = props.onCollaboratorModeChange;
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
  };

  stopCollaboration = () => {
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
      commitToHistory: false,
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
            'client-broadcast': async (encryptedData: ArrayBuffer) => {
              const decodedData = new TextDecoder().decode(encryptedData);
              const decryptedData = JSON.parse(decodedData);

              switch (decryptedData.type) {
                case 'INVALID_RESPONSE':
                  return;
                case WS_SCENE_EVENT_TYPES.INIT: {
                  if (!this.portal.socketInitialized) {
                    this.initializeRoom({ fetchScene: false });
                    const remoteElements = decryptedData.payload.elements;
                    const remoteFiles = decryptedData.payload.files;
                    this.handleRemoteSceneUpdate(this.reconcileElements(remoteElements, remoteFiles), {
                      init: true,
                    });
                  }
                  resolve();
                  break;
                }
                case WS_SCENE_EVENT_TYPES.SCENE_UPDATE: {
                  const remoteElements = decryptedData.payload.elements;
                  const remoteFiles = decryptedData.payload.files;
                  this.handleRemoteSceneUpdate(this.reconcileElements(remoteElements, remoteFiles));
                  break;
                }

                case WS_SCENE_EVENT_TYPES.MOUSE_LOCATION: {
                  const { pointer, button, username, selectedElementIds } = decryptedData.payload;
                  const socketId: SocketUpdateDataSource['MOUSE_LOCATION']['payload']['socketId'] =
                    decryptedData.payload.socketId ||
                    // @ts-ignore legacy, see #2094 (#2097)
                    decryptedData.payload.socketID;

                  const collaborators = new Map(this.collaborators);
                  const user = collaborators.get(socketId) || {}!;
                  user.pointer = pointer;
                  user.button = button;
                  user.selectedElementIds = selectedElementIds;
                  user.username = username;
                  collaborators.set(socketId, user);
                  this.excalidrawAPI.updateScene({
                    collaborators,
                  });
                  break;
                }
              }
            },
            'first-in-room': async () => {
              await this.initializeRoom({
                fetchScene: true,
                roomLinkData: existingRoomLinkData,
              });

              resolve();
            },
            saved: () => {
              this.onSavedToDatabase?.();
            },
            'collaborator-mode': event => {
              this.onCollaboratorModeChange(event);
            },
            'idle-state': ({ userState, socketId, username }) => {
              const collaborators = new Map(this.collaborators);
              const user = collaborators.get(socketId) || {}!;
              user.userState = userState;
              user.username = username;
              this.excalidrawAPI.updateScene({
                collaborators,
              });
            },
          }
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        this.state.errorMessage = (error as { message: string } | undefined)?.message ?? '';
        reject(error);
      }

      this.initializeIdleDetector();

      this.state.activeRoomLink = window.location.href;
    });

  private initializeRoom = async ({
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
        // log the error and move on. other peers will sync us the scene.
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        this.portal.socketInitialized = true;
      }
    } else {
      this.portal.socketInitialized = true;
    }
  };

  private reconcileElements = (
    remoteElements: readonly ExcalidrawElement[],
    remoteFiles: BinaryFilesWithUrl
  ): ReconciledElements => {
    const localElements = this.getSceneElementsIncludingDeleted();
    const appState = this.excalidrawAPI.getAppState();

    remoteElements = restoreElements(remoteElements, null);

    const reconciledElements = _reconcileElements(localElements, remoteElements, appState);

    // Download the files that this instance is missing:
    this.filesManager.loadFiles({ files: remoteFiles });

    // Avoid broadcasting to the rest of the collaborators the scene
    // we just received!
    // Note: this needs to be set before updating the scene as it
    // synchronously calls render.
    this.setLastBroadcastedOrReceivedSceneVersion(getSceneVersion(reconciledElements));

    return reconciledElements;
  };

  private handleRemoteSceneUpdate = (elements: ReconciledElements, { init = false }: { init?: boolean } = {}) => {
    this.excalidrawAPI.updateScene({
      elements,
      commitToHistory: !!init,
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

  private setCollaborators = (sockets: string[]) => {
    const collaborators = new Map<string, Collaborator>();

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

  private setLastBroadcastedOrReceivedSceneVersion = (version: number) => {
    this.lastBroadcastedOrReceivedSceneVersion = version;
  };

  private getLastBroadcastedOrReceivedSceneVersion = () => {
    return this.lastBroadcastedOrReceivedSceneVersion;
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

  public syncScene = async (elements: readonly ExcalidrawElement[], files: BinaryFilesWithUrl) => {
    if (getSceneVersion(elements) > this.getLastBroadcastedOrReceivedSceneVersion()) {
      this.portal.broadcastScene(WS_SCENE_EVENT_TYPES.SCENE_UPDATE, elements, files, { syncAll: false });
      this.lastBroadcastedOrReceivedSceneVersion = getSceneVersion(elements);
      this.queueBroadcastAllElements();
    }
  };

  private queueBroadcastAllElements = throttle(async () => {
    const elements = this.excalidrawAPI.getSceneElementsIncludingDeleted();
    const files = await this.filesManager.getUploadedFiles(this.excalidrawAPI.getFiles());
    this.portal.broadcastScene(WS_SCENE_EVENT_TYPES.SCENE_UPDATE, elements, files, { syncAll: true });
    const currentVersion = this.getLastBroadcastedOrReceivedSceneVersion();
    const newVersion = Math.max(currentVersion, getSceneVersion(this.getSceneElementsIncludingDeleted()));
    this.setLastBroadcastedOrReceivedSceneVersion(newVersion);
  }, SYNC_FULL_SCENE_INTERVAL_MS);
}

export default Collab;
