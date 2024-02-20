import { throttle } from 'lodash';
import { BinaryFiles, Collaborator, ExcalidrawImperativeAPI, Gesture } from '@alkemio/excalidraw/types/types';
import {
  ACTIVE_THRESHOLD,
  CURSOR_SYNC_TIMEOUT,
  EVENT,
  IDLE_THRESHOLD,
  SYNC_FULL_SCENE_INTERVAL_MS,
  WS_SCENE_EVENT_TYPES,
} from './excalidrawAppConstants';
import { ImportedDataState } from '@alkemio/excalidraw/types/data/types';
import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import { getSceneVersion, newElementWith, restoreElements } from '@alkemio/excalidraw';
import { isImageElement, UserIdleState } from './utils';
import { getCollabServer, SocketUpdateDataSource } from './data';
import Portal from './Portal';
import { ReconciledElements, reconcileElements as _reconcileElements } from './reconciliation';
import { WhiteboardFilesManager } from '../useWhiteboardFilesManager';

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
  private alreadySharedFiles: string[] = [];

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
      onCloseConnection: this.handleCloseConnection,
    });
    this.onCloseConnection = props.onCloseConnection;
    this.excalidrawAPI = props.excalidrawApi;
    this.filesManager = props.filesManager;
    this.onSavedToDatabase = props.onSavedToDatabase;
    this.alreadySharedFiles.push(...Object.keys(this.excalidrawAPI.getFiles()));
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

  startCollaboration = async (existingRoomLinkData: { roomId: string }): Promise<ImportedDataState | null> =>
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
                    const reconciledElements = this.reconcileElements(remoteElements);
                    this.handleRemoteSceneUpdate(reconciledElements, {
                      init: true,
                    });
                    // noop if already resolved via init from firebase
                    resolve({
                      elements: reconciledElements,
                      scrollToContent: true,
                    });

                    // Download files from the storageBucket here:
                    // Files included in the canvas:
                    const requiredFilesIds = reconciledElements.reduce<string[]>((files, element) => {
                      if (element.type === 'image' && element.fileId) {
                        files.push(element.fileId);
                      }
                      return files;
                    }, []);
                    // Files missing in this client:
                    const currentFiles = Object.keys(this.excalidrawAPI.getFiles());
                    const missingFiles = requiredFilesIds.filter(fileId => !currentFiles.includes(fileId));

                    if (missingFiles.length > 0) {
                      this.portal.broadcastFileRequest(missingFiles);
                    }

                    this.filesManager.loadFiles({ files: this.excalidrawAPI.getFiles() });
                  }

                  break;
                }

                case WS_SCENE_EVENT_TYPES.UPDATE: {
                  this.handleRemoteSceneUpdate(this.reconcileElements(decryptedData.payload.elements));
                  break;
                }

                case 'FILE_UPLOAD': {
                  const payload = decryptedData.payload as SocketUpdateDataSource['FILE_UPLOAD']['payload'];
                  const currentFiles = this.excalidrawAPI.getFiles();

                  if (!currentFiles[payload.file.id]) {
                    this.alreadySharedFiles.push(payload.file.id);
                    this.excalidrawAPI.addFiles([payload.file]);
                    this.filesManager.loadFiles({ files: { [payload.file.id]: payload.file } });
                  }

                  break;
                }

                case 'FILE_REQUEST': {
                  const payload = decryptedData.payload as SocketUpdateDataSource['FILE_REQUEST']['payload'];
                  const currentFiles = this.excalidrawAPI.getFiles();
                  if (payload.fileIds && payload.fileIds.length > 0) {
                    payload.fileIds.forEach(async id => {
                      if (currentFiles[id]) {
                        const file = await this.filesManager.convertLocalFileToRemote(currentFiles[id]);
                        file && this.portal.broadcastFile(file);
                      }
                    });
                  }
                  break;
                }

                case 'MOUSE_LOCATION': {
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

                case 'IDLE_STATUS': {
                  const { userState, socketId, username } = decryptedData.payload;
                  const collaborators = new Map(this.collaborators);
                  const user = collaborators.get(socketId) || {}!;
                  user.userState = userState;
                  user.username = username;
                  this.excalidrawAPI.updateScene({
                    collaborators,
                  });
                  break;
                }

                case 'SAVED': {
                  this.onSavedToDatabase?.();
                  break;
                }
              }
            },
            'first-in-room': async () => {
              const sceneData = await this.initializeRoom({
                fetchScene: true,
                roomLinkData: existingRoomLinkData,
              });

              resolve(sceneData);
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
      //this.excalidrawAPI.resetScene();

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

    return null;
  };

  private reconcileElements = (remoteElements: readonly ExcalidrawElement[]): ReconciledElements => {
    const localElements = this.getSceneElementsIncludingDeleted();
    const appState = this.excalidrawAPI.getAppState();

    remoteElements = restoreElements(remoteElements, null);

    const reconciledElements = _reconcileElements(localElements, remoteElements, appState);

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

  public setLastBroadcastedOrReceivedSceneVersion = (version: number) => {
    this.lastBroadcastedOrReceivedSceneVersion = version;
  };

  public getLastBroadcastedOrReceivedSceneVersion = () => {
    return this.lastBroadcastedOrReceivedSceneVersion;
  };

  public getSceneElementsIncludingDeleted = () => {
    return this.excalidrawAPI.getSceneElementsIncludingDeleted();
  };

  onPointerUpdate = throttle(
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

  onIdleStateChange = (userState: UserIdleState) => {
    this.portal.broadcastIdleChange(userState, this.state.username);
  };

  broadcastElements = (elements: readonly ExcalidrawElement[]) => {
    if (getSceneVersion(elements) > this.getLastBroadcastedOrReceivedSceneVersion()) {
      this.portal.broadcastScene(WS_SCENE_EVENT_TYPES.UPDATE, elements);
      this.lastBroadcastedOrReceivedSceneVersion = getSceneVersion(elements);
      this.queueBroadcastAllElements();
    }
  };

  syncElements = (elements: readonly ExcalidrawElement[]) => {
    this.broadcastElements(elements);
  };

  syncFiles = async (files: BinaryFiles) => {
    for (const id of Object.keys(files)) {
      if (!this.alreadySharedFiles.includes(id)) {
        const file = files[id];
        const fileWithUrl = await this.filesManager.convertLocalFileToRemote(file);

        if (fileWithUrl) {
          this.portal.broadcastFile(fileWithUrl);
          this.alreadySharedFiles.push(id);
        }
      }
    }
  };

  notifySavedToDatabase = () => {
    this.portal.broadcastSavedEvent(this.state.username);
  };

  queueBroadcastAllElements = throttle(() => {
    this.portal.broadcastScene(WS_SCENE_EVENT_TYPES.UPDATE, this.excalidrawAPI.getSceneElementsIncludingDeleted(), {
      syncAll: true,
    });
    const currentVersion = this.getLastBroadcastedOrReceivedSceneVersion();
    const newVersion = Math.max(currentVersion, getSceneVersion(this.getSceneElementsIncludingDeleted()));
    this.setLastBroadcastedOrReceivedSceneVersion(newVersion);
  }, SYNC_FULL_SCENE_INTERVAL_MS);
}

export default Collab;
