import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { WhiteboardBinding } from '@alkemio/excalidraw-yjs-binding';
import { useRef, useState } from 'react';
import {
  type ControlMessage,
  UnifiedCollabProvider,
} from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import { validateGuestName } from '@/domain/collaboration/whiteboard/guestAccess/utils/guestNameValidator';
import { getGuestName } from '@/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage';
import { GUEST_SHARE_PATH } from '@/domain/collaboration/whiteboard/utils/buildGuestShareUrl';
import { type CollaboratorMode, CollaboratorModeReasons } from './excalidrawAppConstants';

/** Payload Excalidraw hands to `onPointerUpdate`; routed to awareness by the binding. */
type PointerUpdatePayload = {
  pointer: { x: number; y: number; tool?: 'pointer' | 'laser' } | null;
  button: 'up' | 'down';
  pointersMap?: Map<number, { x: number; y: number }>;
};

export interface CollabAPI {
  /** Local pointer move → awareness (the binding owns cursor presence). */
  onPointerUpdate: (payload: PointerUpdatePayload) => void;
  /**
   * No-op: the `WhiteboardBinding` owns the scene→Y.Doc write path (per-property
   * CRDT). Retained so the wrapper's call site stays stable. Kept synchronous.
   */
  syncScene: () => void;
  isCollaborating: () => boolean;
  /** Broadcast an ephemeral floating emoji to other collaborators (never persisted). */
  broadcastEmojiReaction: (emoji: string, x: number, y: number) => void;
  broadcastCountdownTimer: (remainingSeconds: number, startedBy: string, active: boolean) => void;
}

export interface CollabState {
  collaborating: boolean;
  connecting: boolean;
  mode: CollaboratorMode | null;
  modeReason: CollaboratorModeReasons | null;
  isReadOnly: boolean;
}

type UseCollabProps = {
  username: string;
  onRemoteSave?: (error?: string) => void;
  onCloseConnection: () => void;
  onSceneInitChange?: (initialized: boolean) => void;
};

type InitProps = {
  excalidrawApi: ExcalidrawImperativeAPI;
  roomId: string;
};

type UseCollabProvided = [CollabAPI | null, (initProps: InitProps) => () => void, CollabState];

/**
 * On the public guest-share route, resolve the validated guest display name so the
 * provider sends it as `?guestName=` on the handshake (the unified service's
 * anonymous-identity path). Off that route, an authenticated session cookie is
 * used instead, so this returns undefined. Mirrors the legacy Portal.ts guard.
 */
function resolveGuestName(): string | undefined {
  if (!globalThis.window?.location.pathname.startsWith(GUEST_SHARE_PATH)) return undefined;
  const name = getGuestName();
  if (name && validateGuestName(name).valid) return name;
  return undefined;
}

/** Map a server collaborator-mode reason to the client enum (1:1 with control.go). */
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

/**
 * Whiteboard real-time collaboration on the unified collaboration service
 * (`/collab/<roomId>?type=whiteboard`) via `UnifiedCollabProvider` +
 * `WhiteboardBinding`. The binding owns the Excalidraw scene ↔ `Y.Doc` loop
 * (per-property CRDT merge), routes cursors/selection/idle to y-protocols
 * awareness, and routes emoji/countdown to the provider's ephemeral channel —
 * replacing the legacy Socket.IO `Collab`/`Portal` element-broadcast path.
 *
 * Returns the same `[CollabAPI, initialize, CollabState]` shape the wrapper
 * consumed before, so the editor wiring is unchanged at the call site.
 */
const useCollab = ({
  username,
  onRemoteSave,
  onCloseConnection,
  onSceneInitChange,
}: UseCollabProps): UseCollabProvided => {
  const providerRef = useRef<UnifiedCollabProvider | null>(null);
  const collabApiRef = useRef<CollabAPI | null>(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [isSceneInitialized, setIsSceneInitialized] = useState(false);
  const [collaboratorMode, setCollaboratorMode] = useState<CollaboratorMode | null>(null);
  const [collaboratorModeReason, setCollaboratorModeReason] = useState<CollaboratorModeReasons | null>(null);

  const initialize = ({ excalidrawApi, roomId }: InitProps): (() => void) => {
    const provider = new UnifiedCollabProvider({
      documentId: roomId,
      type: 'whiteboard',
      guestName: resolveGuestName(),
      connect: false,
    });
    providerRef.current = provider;

    // Announce identity so peers render this collaborator's cursor.
    provider.awareness.setLocalStateField('user', { name: username });

    const binding = new WhiteboardBinding(provider.doc, excalidrawApi, {
      awareness: provider.awareness,
      ephemeral: provider.ephemeralChannel,
    });

    const handleStatus = (status: 'connecting' | 'connected' | 'disconnected') => {
      setIsConnecting(status === 'connecting');
      if (status === 'connected') {
        setIsCollaborating(true);
      } else if (status === 'disconnected') {
        setIsCollaborating(false);
        onCloseConnection();
      }
    };

    const handleSynced = (synced: boolean) => {
      setIsSceneInitialized(synced);
      onSceneInitChange?.(synced);
    };

    const handleControl = (message: ControlMessage) => {
      switch (message.kind) {
        case 'saved':
          onRemoteSave?.();
          break;
        case 'save-error':
          onRemoteSave?.(message.error ?? 'save-error');
          break;
        case 'collaborator-mode':
          setCollaboratorMode(message.mode === 'write' ? 'write' : 'read');
          setCollaboratorModeReason(toModeReason(message.reason));
          break;
        case 'read-only-state':
          // A read-only downgrade also rides on read-only-state; reflect it as the
          // collaborator mode so the editor toggles view-mode.
          setCollaboratorMode(message.readOnly ? 'read' : 'write');
          if (message.reason) setCollaboratorModeReason(toModeReason(message.reason));
          break;
        default:
          break;
      }
    };

    provider.on('status', handleStatus);
    provider.on('synced', handleSynced);
    provider.on('control', handleControl);
    provider.connect();
    setIsConnecting(true);

    const collabApi: CollabAPI = {
      onPointerUpdate: payload => binding.awarenessRouter?.onPointerUpdate(payload),
      syncScene: () => {},
      isCollaborating: () => providerRef.current?.status === 'connected',
      broadcastEmojiReaction: (emoji, x, y) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        binding.awarenessRouter?.broadcastEmojiReaction({ id, emoji, x, y });
      },
      broadcastCountdownTimer: (remainingSeconds, startedBy, active) => {
        binding.awarenessRouter?.broadcastCountdownTimer({ remainingSeconds, startedBy, active });
      },
    };
    collabApiRef.current = collabApi;

    return () => {
      provider.off('status', handleStatus);
      provider.off('synced', handleSynced);
      provider.off('control', handleControl);
      binding.destroy();
      provider.destroy();
      providerRef.current = null;
      collabApiRef.current = null;
      setIsCollaborating(false);
      setIsSceneInitialized(false);
      setCollaboratorMode(null);
      setCollaboratorModeReason(null);
    };
  };

  return [
    collabApiRef.current,
    initialize,
    {
      connecting: isConnecting,
      collaborating: isCollaborating && collaboratorMode !== null,
      mode: collaboratorMode,
      modeReason: collaboratorModeReason,
      isReadOnly: isConnecting || !isCollaborating || collaboratorMode === 'read' || !isSceneInitialized,
    },
  ];
};

export default useCollab;
