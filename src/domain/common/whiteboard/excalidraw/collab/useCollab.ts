import type { ExcalidrawImperativeAPI } from '@excalidraw-yjs/excalidraw/types';
import { useCallback, useRef, useState } from 'react';
import {
  type CollaborationState,
  type ControlMessage,
  UnifiedCollabProvider,
} from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import { resolveWhiteboardGuestIdentity } from '@/domain/collaboration/whiteboard/guestAccess/utils/resolveWhiteboardGuestIdentity';
import { AwarenessRouter } from './awarenessRouter';
import { type CollaboratorMode, CollaboratorModeReasons } from './excalidrawAppConstants';

type PointerUpdatePayload = {
  pointer: { x: number; y: number; tool?: 'pointer' | 'laser' } | null;
  button: 'up' | 'down';
  pointersMap?: Map<number, { x: number; y: number }>;
};

export type CollabAPI = {
  onPointerUpdate: (payload: PointerUpdatePayload) => void;
  isCollaborating: () => boolean;
  requestDurability: () => Promise<void>;
  resume: () => void;
  broadcastEmojiReaction: (emoji: string, x: number, y: number) => void;
  broadcastCountdownTimer: (remainingSeconds: number, startedBy: string, active: boolean) => void;
};

export type CollabState = {
  state: CollaborationState;
  collaborating: boolean;
  connecting: boolean;
  mode: CollaboratorMode | null;
  modeReason: CollaboratorModeReasons | null;
  isReadOnly: boolean;
};

type UseCollabProps = {
  username: string;
  onRemoteSave?: (error?: string) => void;
  onSceneInitChange?: (initialized: boolean) => void;
};

type InitProps = { excalidrawApi: ExcalidrawImperativeAPI; roomId: string };
type UseCollabProvided = [CollabAPI | null, (initProps: InitProps) => () => void, CollabState];

const CURSOR_COLORS = [
  '#958DF1',
  '#F98181',
  '#FBBC88',
  '#70CFF8',
  '#94FADB',
  '#B9F18D',
  '#EEC759',
  '#9BB8CD',
  '#FF90BC',
  '#DC8686',
  '#7ED7C1',
];

function cursorColorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

function toModeReason(reason: string | undefined): CollaboratorModeReasons | null {
  switch (reason) {
    case 'room-capacity-reached':
      return CollaboratorModeReasons.ROOM_CAPACITY_REACHED;
    case 'multi-user-not-allowed':
      return CollaboratorModeReasons.MULTI_USER_NOT_ALLOWED;
    case 'inactivity':
      return CollaboratorModeReasons.INACTIVITY;
    default:
      return null;
  }
}

const useCollab = ({ username, onRemoteSave, onSceneInitChange }: UseCollabProps): UseCollabProvided => {
  const [collabApi, setCollabApi] = useState<CollabAPI | null>(null);
  const [state, setState] = useState<CollaborationState>({ status: 'connecting' });
  const [mode, setMode] = useState<CollaboratorMode | null>(null);
  const [modeReason, setModeReason] = useState<CollaboratorModeReasons | null>(null);
  const callbacksRef = useRef({ onRemoteSave, onSceneInitChange });
  callbacksRef.current = { onRemoteSave, onSceneInitChange };

  const initialize = useCallback(
    ({ excalidrawApi, roomId }: InitProps): (() => void) => {
      // The hook survives a document prop change while the editor remounts. Do
      // not let document B inherit document A's ready state before B has synced.
      setState({ status: 'connecting' });
      const provider = new UnifiedCollabProvider({
        documentId: roomId,
        type: 'whiteboard',
        scenePort: {
          encodeSceneStateVector: () => excalidrawApi.encodeSceneStateVector(),
          encodeSceneAsUpdate: (format, targetStateVector) =>
            excalidrawApi.encodeSceneAsUpdate(format, targetStateVector),
          applyRemoteSceneUpdate: (update, format) => excalidrawApi.applyRemoteSceneUpdate(update, format),
          onLocalSceneUpdate: (listener, format) => excalidrawApi.onLocalSceneUpdate(listener, format),
        },
        guestName: resolveWhiteboardGuestIdentity().guestName,
        connect: false,
      });
      provider.awareness.setLocalStateField('user', { username, color: cursorColorFor(username) });
      const awarenessRouter = new AwarenessRouter({
        awareness: provider.awareness,
        api: excalidrawApi,
        ephemeral: provider.ephemeralChannel,
      });
      let fitted = false;
      let initialized = false;

      const handleState = (next: CollaborationState) => {
        setState(next);
        if (next.status !== 'ready') return;
        if (!initialized) {
          initialized = true;
          callbacksRef.current.onSceneInitChange?.(true);
        }
        setMode(previous => previous ?? 'write');
        if (!fitted) {
          fitted = true;
          const elements = excalidrawApi.getSceneElements();
          if (elements.length > 0) {
            excalidrawApi.scrollToContent(elements, {
              animate: false,
              fitToViewport: true,
              viewportZoomFactor: 0.75,
              maxZoom: 1,
            });
          }
        }
      };

      const handleControl = (message: ControlMessage) => {
        switch (message.kind) {
          case 'saved':
            callbacksRef.current.onRemoteSave?.();
            break;
          case 'save-error':
            callbacksRef.current.onRemoteSave?.(message.error ?? 'save-error');
            break;
          case 'collaborator-mode':
          case 'read-only-state':
            setMode(message.mode === 'write' || message.readOnly === false ? 'write' : 'read');
            setModeReason(toModeReason(message.reason));
            break;
          default:
            break;
        }
      };

      provider.on('state', handleState);
      provider.on('control', handleControl);
      provider.connect();

      const collabApi: CollabAPI = {
        onPointerUpdate: payload => awarenessRouter.onPointerUpdate(payload),
        isCollaborating: () => provider.state.status === 'ready',
        requestDurability: () => provider.requestDurability(),
        resume: () => {
          setMode(null);
          setModeReason(null);
          provider.disconnect();
          provider.connect();
        },
        broadcastEmojiReaction: (emoji, x, y) => {
          awarenessRouter.broadcastEmojiReaction({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            emoji,
            x,
            y,
          });
        },
        broadcastCountdownTimer: (remainingSeconds, startedBy, active) =>
          awarenessRouter.broadcastCountdownTimer({ remainingSeconds, startedBy, active }),
      };
      setCollabApi(collabApi);

      return () => {
        provider.off('state', handleState);
        provider.off('control', handleControl);
        awarenessRouter.destroy();
        provider.destroy();
        setCollabApi(null);
        callbacksRef.current.onSceneInitChange?.(false);
        setMode(null);
        setModeReason(null);
      };
    },
    [username]
  );

  const collaborating = state.status === 'ready' || state.status === 'reconnecting';
  return [
    collabApi,
    initialize,
    {
      state,
      collaborating,
      connecting: state.status === 'connecting' || state.status === 'reconnecting',
      mode,
      modeReason,
      isReadOnly: state.status === 'connecting' || state.status === 'closed' || mode === 'read',
    },
  ];
};

export default useCollab;
