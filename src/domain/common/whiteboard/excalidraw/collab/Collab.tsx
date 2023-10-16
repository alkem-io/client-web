import throttle from 'lodash.throttle';
import { MutableRefObject, PureComponent, RefCallback } from 'react';
import { BinaryFiles, Collaborator, ExcalidrawImperativeAPI, Gesture } from '@alkemio/excalidraw/types/types';
import {
  ACTIVE_THRESHOLD,
  CURSOR_SYNC_TIMEOUT,
  EVENT,
  IDLE_THRESHOLD,
  INITIAL_SCENE_UPDATE_TIMEOUT,
  SYNC_FULL_SCENE_INTERVAL_MS,
  WS_SCENE_EVENT_TYPES,
} from './excalidrawAppConstants';
import { ImportedDataState } from '@alkemio/excalidraw/types/data/types';
import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import { getSceneVersion, newElementWith, restoreElements } from '@alkemio/excalidraw';
import { isImageElement, resolvablePromise, UserIdleState } from './utils';
import { generateCollaborationLinkData, getCollabServer, SocketUpdateDataSource } from './data';
import Portal from './Portal';
import { ReconciledElements, reconcileElements as _reconcileElements } from './reconciliation';
import { atom, createStore } from 'jotai';
import { WhiteboardFilesManager } from '../useWhiteboardFilesManager';

const appJotaiStore = createStore();

export const collabAPIAtom = atom<CollabAPI | null>(null);
export const isOfflineAtom = atom(false);

interface CollabState {
  errorMessage: string;
  username: string;
  activeRoomLink: string;
}

type CollabInstance = InstanceType<typeof Collab>;

export interface CollabAPI {
  /** function so that we can access the latest value from stale callbacks */
  onPointerUpdate: CollabInstance['onPointerUpdate'];
  startCollaboration: CollabInstance['startCollaboration'];
  stopCollaboration: CollabInstance['stopCollaboration'];
  syncElements: CollabInstance['syncElements'];
  syncFiles: CollabInstance['syncFiles'];
  notifySavedToDatabase: () => void; // Notify rest of the members in the room that I have saved the whiteboard
}

interface PublicProps {
  excalidrawAPI: ExcalidrawImperativeAPI;
  username: string;
  collabAPIRef?: MutableRefObject<CollabAPI | null> | RefCallback<CollabAPI | null>;
  onSavedToDatabase?: () => void; // Someone in your room saved the whiteboard to the database
  filesManager: WhiteboardFilesManager;
}

type Props = PublicProps;

class Collab extends PureComponent<Props, CollabState> {
  portal: Portal;
  excalidrawAPI: Props['excalidrawAPI'];
  filesManager: Props['filesManager'];
  activeIntervalId: number | null;
  idleTimeoutId: number | null;

  private socketInitializationTimer?: number;
  private lastBroadcastedOrReceivedSceneVersion: number = -1;
  private collaborators = new Map<string, Collaborator>();
  private onSavedToDatabase: (() => void) | undefined;
  private alreadySharedFiles: string[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      errorMessage: '',
      username: props.username,
      activeRoomLink: '',
    };
    this.portal = new Portal(this, props.filesManager);
    this.excalidrawAPI = props.excalidrawAPI;
    this.filesManager = props.filesManager;
    this.activeIntervalId = null;
    this.idleTimeoutId = null;
    this.onSavedToDatabase = props.onSavedToDatabase;
    this.alreadySharedFiles.push(...Object.keys(this.excalidrawAPI.getFiles()));
  }

  componentDidMount() {
    window.addEventListener('online', this.onOfflineStatusToggle);
    window.addEventListener('offline', this.onOfflineStatusToggle);
    window.addEventListener(EVENT.UNLOAD, this.onUnload);

    this.onOfflineStatusToggle();

    const collabAPI: CollabAPI = {
      onPointerUpdate: this.onPointerUpdate,
      startCollaboration: this.startCollaboration,
      syncElements: this.syncElements,
      syncFiles: this.syncFiles,
      stopCollaboration: this.stopCollaboration,
      notifySavedToDatabase: this.notifySavedToDatabase,
    };

    appJotaiStore.set(collabAPIAtom, collabAPI);

    if (typeof this.props.collabAPIRef === 'function') {
      this.props.collabAPIRef(collabAPI);
    } else if (this.props.collabAPIRef) {
      this.props.collabAPIRef.current = collabAPI;
    }

    if (import.meta.env.MODE === 'development') {
      window.collab = window.collab || ({} as Window['collab']);
      Object.defineProperties(window, {
        collab: {
          configurable: true,
          value: this,
        },
      });
    }
  }

  onOfflineStatusToggle = () => {
    appJotaiStore.set(isOfflineAtom, !window.navigator.onLine);
  };

  componentWillUnmount() {
    window.removeEventListener('online', this.onOfflineStatusToggle);
    window.removeEventListener('offline', this.onOfflineStatusToggle);
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

  stopCollaboration = () => {
    this.queueBroadcastAllElements.cancel();

    if (this.portal.socket && this.fallbackInitializationHandler) {
      this.portal.socket.off('connect_error', this.fallbackInitializationHandler);
    }

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

  private destroySocketClient = (opts?: { isUnload: boolean }) => {
    this.lastBroadcastedOrReceivedSceneVersion = -1;
    this.portal.close();
    if (!opts?.isUnload) {
      this.setState({
        activeRoomLink: '',
      });
      this.collaborators = new Map();
      this.excalidrawAPI.updateScene({
        collaborators: this.collaborators,
      });
    }
  };

  private fallbackInitializationHandler: null | (() => unknown) = null;

  startCollaboration = async (existingRoomLinkData: null | { roomId: string }): Promise<ImportedDataState | null> => {
    if (this.portal.socket) {
      return null;
    }

    let roomId;

    if (existingRoomLinkData) {
      ({ roomId } = existingRoomLinkData);
    } else {
      ({ roomId } = await generateCollaborationLinkData());
    }

    const scenePromise = resolvablePromise<ImportedDataState | null>();

    const { default: socketIOClient } = await import('socket.io-client');

    const fallbackInitializationHandler = () => {
      this.initializeRoom({
        roomLinkData: existingRoomLinkData,
        fetchScene: true,
      }).then(scene => {
        scenePromise.resolve(scene);
      });
    };
    this.fallbackInitializationHandler = fallbackInitializationHandler;

    try {
      const socketServerData = await getCollabServer();

      this.portal.socket = this.portal.open(
        socketIOClient(socketServerData.url, {
          transports: socketServerData.polling ? ['websocket', 'polling'] : ['websocket'],
          path: '/api/private/ws/socket.io',
        }),
        roomId
      );

      this.portal.socket.once('connect_error', fallbackInitializationHandler);
    } catch (error) {
      console.error(error); // eslint-disable no-console
      this.setState({ errorMessage: (error as { message: string } | undefined)?.message ?? '' });
      return null;
    }

    if (!existingRoomLinkData) {
      const elements = this.excalidrawAPI.getSceneElements().map(element => {
        if (isImageElement(element) && element.status === 'saved') {
          return newElementWith(element, { status: 'pending' });
        }
        return element;
      });
      // remove deleted elements from elements array & history to ensure we don't
      // expose potentially sensitive user data in case user manually deletes
      // existing elements (or clears scene), which would otherwise be persisted
      // to database even if deleted before creating the room.
      this.excalidrawAPI.history.clear();
      this.excalidrawAPI.updateScene({
        elements,
        commitToHistory: true,
      });
    }

    // fallback in case you're not alone in the room but still don't receive
    // initial SCENE_INIT message
    this.socketInitializationTimer = window.setTimeout(fallbackInitializationHandler, INITIAL_SCENE_UPDATE_TIMEOUT);

    // All socket listeners are moving to Portal
    this.portal.socket.on('client-broadcast', async (encryptedData: ArrayBuffer) => {
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
            scenePromise.resolve({
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
            this.excalidrawAPI.addFiles([payload.file]);
            this.filesManager.loadFiles({ files: { [payload.file.id]: payload.file } });
            this.alreadySharedFiles.push(payload.file.id);
          }
          break;
        }
        case 'FILE_REQUEST': {
          const payload = decryptedData.payload as SocketUpdateDataSource['FILE_REQUEST']['payload'];
          const currentFiles = this.excalidrawAPI.getFiles();
          if (payload.fileIds && payload.fileIds.length > 0) {
            payload.fileIds.forEach(id => {
              if (currentFiles[id]) {
                this.filesManager
                  .removeExcalidrawAttachment(currentFiles[id])
                  .then(file => file && this.portal.broadcastFile(file));
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
    });

    this.portal.socket.on('first-in-room', async () => {
      if (this.portal.socket) {
        this.portal.socket.off('first-in-room');
      }
      const sceneData = await this.initializeRoom({
        fetchScene: true,
        roomLinkData: existingRoomLinkData,
      });
      scenePromise.resolve(sceneData);
    });

    this.initializeIdleDetector();

    this.setState({
      activeRoomLink: window.location.href,
    });

    return scenePromise;
  };

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
    if (this.portal.socket && this.fallbackInitializationHandler) {
      this.portal.socket.off('connect_error', this.fallbackInitializationHandler);
    }
    if (fetchScene && roomLinkData && this.portal.socket) {
      //this.excalidrawAPI.resetScene();

      try {
        this.queueBroadcastAllElements();
      } catch (error: unknown) {
        // log the error and move on. other peers will sync us the scene.
        console.error(error); // eslint-disable no-console
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

  setCollaborators(sockets: string[]) {
    const collaborators: InstanceType<typeof Collab>['collaborators'] = new Map();
    for (const socketId of sockets) {
      if (this.collaborators.has(socketId)) {
        collaborators.set(socketId, this.collaborators.get(socketId)!);
      } else {
        collaborators.set(socketId, {});
      }
    }
    this.collaborators = collaborators;
    this.excalidrawAPI.updateScene({ collaborators });
  }

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
      payload.pointersMap.size < 2 && this.portal.socket && this.portal.broadcastMouseLocation(payload);
    },
    CURSOR_SYNC_TIMEOUT
  );

  onIdleStateChange = (userState: UserIdleState) => {
    this.portal.broadcastIdleChange(userState);
  };

  broadcastElements = (elements: readonly ExcalidrawElement[]) => {
    if (getSceneVersion(elements) > this.getLastBroadcastedOrReceivedSceneVersion()) {
      this.portal.broadcastScene(WS_SCENE_EVENT_TYPES.UPDATE, elements, false);
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
        const fileWithUrl = await this.filesManager.removeExcalidrawAttachment(file);
        if (fileWithUrl) {
          this.portal.broadcastFile(fileWithUrl);
          this.alreadySharedFiles.push(id);
        }
      }
    }
  };

  notifySavedToDatabase = () => {
    this.portal.broadcastSavedEvent();
  };

  queueBroadcastAllElements = throttle(() => {
    this.portal.broadcastScene(
      WS_SCENE_EVENT_TYPES.UPDATE,
      this.excalidrawAPI.getSceneElementsIncludingDeleted(),
      true
    );
    const currentVersion = this.getLastBroadcastedOrReceivedSceneVersion();
    const newVersion = Math.max(currentVersion, getSceneVersion(this.getSceneElementsIncludingDeleted()));
    this.setLastBroadcastedOrReceivedSceneVersion(newVersion);
  }, SYNC_FULL_SCENE_INTERVAL_MS);

  render() {
    return <></>;
  }
}

declare global {
  interface Window {
    collab: InstanceType<typeof Collab>;
  }
}

if (import.meta.env.MODE === 'development') {
  window.collab = window.collab || ({} as Window['collab']);
}

const _Collab: React.FC<PublicProps> = props => {
  return <Collab {...props} />;
};

export default _Collab;

export type TCollabClass = Collab;
