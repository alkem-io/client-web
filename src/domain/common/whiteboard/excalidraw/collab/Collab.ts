import { throttle } from 'lodash';
import type {
  Collaborator,
  ExcalidrawImperativeAPI,
  Gesture,
  SocketId,
} from '@alkemio/excalidraw/dist/types/excalidraw/types';
import type { ExcalidrawElement, OrderedExcalidrawElement } from '@alkemio/excalidraw/dist/types/element/src/types';
import type {
  reconcileElements as ExcalidrawReconcileElements,
  restoreElements as ExcalidrawRestoreElements,
} from '@alkemio/excalidraw';
import type {
  hashElementsVersion as ExcalidrawHashElementsVersion,
  CaptureUpdateAction as ExcalidrawCaptureUpdateAction,
  newElementWith as ExcalidrawNewElementWith,
} from '@alkemio/excalidraw/dist/types/element/src';
import {
  ACTIVE_THRESHOLD,
  CollaboratorMode,
  CollaboratorModeEvent,
  CURSOR_SYNC_TIMEOUT,
  EVENT,
  IDLE_THRESHOLD,
  SCENE_SYNC_TIMEOUT,
  SYNC_FULL_SCENE_INTERVAL_MS,
  WS_SCENE_EVENT_TYPES,
} from './excalidrawAppConstants';
import { UserIdleState, isImageElement } from './utils';
import { getCollabServer, SocketUpdateData, SocketUpdateDataSource } from './data';
import Portal from './Portal';
import { BinaryFilesWithOptionalUrl, WhiteboardFilesManager } from '../useWhiteboardFilesManager';
import { error as logError, warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import type {
  ReconciledExcalidrawElement,
  RemoteExcalidrawElement,
} from '@alkemio/excalidraw/dist/types/excalidraw/data/reconcile';
import type { Mutable } from '@alkemio/excalidraw/dist/types/common/src/utility-types';
import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';

type CollabState = {
  errorMessage: string;
  username: string;
  activeRoomLink: string;
};

export interface CollabProps {
  excalidrawApi: ExcalidrawImperativeAPI;
  username: string;
  onRemoteSave: (_error?: string) => void; // The client has received a room saved event
  filesManager: WhiteboardFilesManager;
  onCloseConnection: () => void;
  onCollaboratorModeChange: (event: CollaboratorModeEvent) => void;
  onSceneInitChange: (initialized: boolean) => void;
  onIncomingEmojiReaction?: OnIncomingEmojiReactionCallback;
  onIncomingCountdownTimer?: OnIncomingCountdownTimerCallback;
}

type IncomingClientBroadcastData = {
  type: WS_SCENE_EVENT_TYPES | 'INVALID_RESPONSE';
  payload: {
    [key: string]: unknown;
  };
};

// Callback type for incoming emoji reaction events
export type OnIncomingEmojiReactionCallback = (payload: { id: string; emoji: string; x: number; y: number }) => void;
// Callback type for incoming countdown timer events
export type OnIncomingCountdownTimerCallback = (payload: {
  remainingSeconds: number;
  active: boolean;
  startedBy: string;
}) => void;

// List of used functions from Excalidraw that will be lazy loaded
type ExcalidrawUtils = {
  hashElementsVersion: typeof ExcalidrawHashElementsVersion;
  reconcileElements: typeof ExcalidrawReconcileElements;
  restoreElements: typeof ExcalidrawRestoreElements;
  CaptureUpdateAction: typeof ExcalidrawCaptureUpdateAction;
  newElementWith: typeof ExcalidrawNewElementWith;
};

class Collab {
  portal: Portal;
  state: CollabState;
  excalidrawAPI: ExcalidrawImperativeAPI;
  filesManager: WhiteboardFilesManager;
  activeIntervalId: number | null = null;
  idleTimeoutId: number | null = null;

  private lastBroadcastedOrReceivedSceneVersion: number = -1;
  private collaborators = new Map<SocketId, Collaborator>();
  private onCloseConnection: () => void;
  private onCollaboratorModeChange: (event: CollaboratorModeEvent) => void;
  private onSceneInitChange: (initialized: boolean) => void;
  private onIncomingEmojiReaction?: OnIncomingEmojiReactionCallback;
  private onIncomingCountdownTimer?: OnIncomingCountdownTimerCallback;
  private excalidrawUtils: Promise<ExcalidrawUtils>;
  private collaborationMode: CollaboratorMode | undefined = undefined;

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
    this.onIncomingEmojiReaction = props.onIncomingEmojiReaction;
    this.onIncomingCountdownTimer = props.onIncomingCountdownTimer;
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
    this.portal.sceneInitialized = false;
    this.onSceneInitChange(false);
  };

  stopCollaboration = async () => {
    const { CaptureUpdateAction, newElementWith } = await this.excalidrawUtils;

    this.queueBroadcastAllElements.cancel();
    this.destroySocketClient();

    const elements = this.excalidrawAPI.getSceneElementsIncludingDeleted().map(element => {
      if (isImageElement(element) && 'status' in element && element.status === 'saved') {
        return newElementWith(element, { status: 'pending' });
      }
      return element;
    });

    this.excalidrawAPI.updateScene({
      elements,
      captureUpdate: CaptureUpdateAction.NEVER,
    });
  };

  /**
   * Broadcast an ephemeral floating emoji reactions to other clients.
   * Uses volatile channel for real-time animations; missing packets won't cause issues.
   */
  broadcastEmojiReaction = async (emoji: string, x: number, y: number) => {
    try {
      const data = {
        type: WS_SCENE_EVENT_TYPES.EMOJI_REACTION,
        payload: {
          emoji,
          x,
          y,
          id: `${this.portal.roomId}_${Date.now()}`,
        },
      } as SocketUpdateData;
      await this.portal._broadcastSocketData(data, { volatile: true });
    } catch (e) {
      console.error('Failed to broadcast emoji reaction:', e);
    }
  };

  /**
   * Broadcast countdown timer state to other clients.
   * Uses volatile channel for real-time updates; missing packets won't cause issues.
   */
  broadcastCountdownTimer = async (remainingSeconds: number, startedBy: string, active: boolean) => {
    try {
      const data = {
        type: WS_SCENE_EVENT_TYPES.COUNTDOWN_TIMER,
        payload: {
          remainingSeconds,
          active,
          startedBy,
        },
      } as SocketUpdateData;
      await this.portal._broadcastSocketData(data, { volatile: true });
    } catch (e) {
      console.error('Failed to broadcast countdown timer:', e);
    }
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
            'scene-init': async (payload: {
              elements: readonly ExcalidrawElement[];
              files: BinaryFilesWithOptionalUrl;
            }) => {
              if (!this.portal.sceneInitialized) {
                await this.handleRemoteSceneUpdate(
                  await this.reconcileElementsAndLoadFiles(payload.elements, payload.files)
                );
                // scene is initialized, so we can start broadcasting updates
                this.portal.sceneInitialized = true;
                this.onSceneInitChange(true);
                // look for any embedded files that need to be converted ONLY IF the user can edit the scene
                if (this.collaborationMode === 'write') {
                  const convertedFilesWithUrl = await this.filesManager.loadAndTryConvertEmbeddedFiles(payload.files);
                  // broadcast only the converted files
                  if (Object.entries(convertedFilesWithUrl).length) {
                    await this.portal.broadcastScene(WS_SCENE_EVENT_TYPES.SCENE_UPDATE, [], convertedFilesWithUrl);
                  }
                } else {
                  // if the user is not able to edit the scene, we still need to load the files
                  // so that the images are displayed correctly
                  await this.filesManager.loadFiles({ files: payload.files });
                }
              }
              try {
                this.excalidrawAPI.scrollToContent(payload.elements, {
                  animate: false,
                  fitToViewport: true,
                  // both values help with scaling issue when the content is displayed
                  viewportZoomFactor: 0.75, // 75% of the viewport, on preview
                  maxZoom: 1, // 100% zoom, in the whiteboard
                });
              } catch (error) {
                logWarn(`Error trying to fit to content: ${error}`, { category: TagCategoryValues.WHITEBOARD });
              }
            },
            'client-broadcast': async (binaryData: ArrayBuffer) => {
              const strData = new TextDecoder().decode(binaryData);
              let data: IncomingClientBroadcastData | undefined;

              try {
                data = JSON.parse(strData) as IncomingClientBroadcastData;
              } catch (e: unknown) {
                logError(`Unable to parse incoming broadcast: ${e}`);
                return;
              }

              if (isInvalidResponsePayload(data)) {
                return;
              }
              // do not handled mouse location until socket is initialized - this may improve loading times
              if (isMouseLocationPayload(data) && this.portal.sceneInitialized) {
                const { pointer, button, username, selectedElementIds, socketId } = data.payload;
                this.updateCollaborator(socketId, {
                  pointer,
                  button,
                  selectedElementIds,
                  username,
                });
                return;
              }
              if (isSceneUpdatePayload(data)) {
                const remoteElements = data.payload.elements as RemoteExcalidrawElement[];
                const remoteFiles = data.payload.files;
                await this.handleRemoteSceneUpdate(
                  await this.reconcileElementsAndLoadFiles(remoteElements, remoteFiles)
                );
                return;
              }
              if (isEmojiReactionPayload(data)) {
                try {
                  const { emoji, x, y, id } = data.payload;
                  // Forward to callback to display (optional subscriber)
                  this.onIncomingEmojiReaction?.({
                    id: id || `${data.type}_${Date.now()}`,
                    emoji,
                    x,
                    y,
                  });
                } catch (e) {
                  console.error('Failed to handle incoming emoji reaction:', e);
                }
                return;
              }
              if (isCountdownTimerPayload(data)) {
                try {
                  const { remainingSeconds, active, startedBy } = data.payload;
                  // Forward to callback to display (optional subscriber)
                  this.onIncomingCountdownTimer?.({
                    remainingSeconds,
                    active,
                    startedBy,
                  });
                } catch (e) {
                  console.error('Failed to handle incoming countdown timer:', e);
                }
                return;
              }
            },
            'collaborator-mode': event => {
              resolve();
              this.collaborationMode = event.mode;
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

  private reconcileElementsAndLoadFiles = async (
    remoteElements: readonly ExcalidrawElement[],
    remoteFiles: BinaryFilesWithOptionalUrl
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

  private handleRemoteSceneUpdate = async (elements: ReconciledExcalidrawElement[]) => {
    const { CaptureUpdateAction } = await this.excalidrawUtils;

    this.excalidrawAPI.updateScene({
      elements,
      // user is not able to undo any of the incoming change
      // user is only able to undo their own changes, since they are not incoming
      captureUpdate: CaptureUpdateAction.NEVER,
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

  private throttledSyncScene = throttle(
    async (elements: readonly OrderedExcalidrawElement[], files: BinaryFilesWithOptionalUrl) => {
      const { hashElementsVersion } = await this.excalidrawUtils;
      const newVersion = hashElementsVersion(elements);

      if (newVersion !== this.lastBroadcastedOrReceivedSceneVersion) {
        this.portal.broadcastScene(WS_SCENE_EVENT_TYPES.SCENE_UPDATE, elements, files, { syncAll: false });
        this.lastBroadcastedOrReceivedSceneVersion = newVersion;
        this.queueBroadcastAllElements();
      }
    },
    SCENE_SYNC_TIMEOUT
  );

  public syncScene = async (elements: readonly OrderedExcalidrawElement[], files: BinaryFilesWithOptionalUrl) => {
    this.throttledSyncScene(elements, files);
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
const isEmojiReactionPayload = (data: IncomingClientBroadcastData): data is SocketUpdateDataSource['EMOJI_REACTION'] =>
  data.type === WS_SCENE_EVENT_TYPES.EMOJI_REACTION;
const isCountdownTimerPayload = (
  data: IncomingClientBroadcastData
): data is SocketUpdateDataSource['COUNTDOWN_TIMER'] => data.type === WS_SCENE_EVENT_TYPES.COUNTDOWN_TIMER;
