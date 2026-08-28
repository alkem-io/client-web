import type { ExcalidrawImperativeAPI } from '@excalidraw-yjs/excalidraw/types';
import { useRef, useState } from 'react';
import {
  type CollaborationAccess,
  type CollaborationPhase,
  deriveCollaborationState,
} from '@/domain/collaboration/realTimeCollaboration/collaborationPhase';
import {
  type CloseVerdict,
  type ControlMessage,
  classifySessionEnd,
  type SessionEndInfo,
  UnifiedCollabProvider,
} from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import { resolveWhiteboardGuestIdentity } from '@/domain/collaboration/whiteboard/guestAccess/utils/resolveWhiteboardGuestIdentity';
import { AwarenessRouter } from './awarenessRouter';
import { type CollaboratorMode, CollaboratorModeReasons } from './excalidrawAppConstants';

/** Payload Excalidraw hands to `onPointerUpdate`; routed to awareness by the AwarenessRouter. */
type PointerUpdatePayload = {
  pointer: { x: number; y: number; tool?: 'pointer' | 'laser' } | null;
  button: 'up' | 'down';
  pointersMap?: Map<number, { x: number; y: number }>;
};

export type CollabAPI = {
  /** Local pointer move → awareness (the AwarenessRouter owns cursor presence). */
  onPointerUpdate: (payload: PointerUpdatePayload) => void;
  isCollaborating: () => boolean;
  /** Wait until every preceding scene update is durable in both collaboration stores. */
  requestDurability: () => Promise<void>;
  /** Persist the provider's complete pending scene, including edits made while an acknowledgement is in flight. */
  persistPendingChanges: (options?: { force?: boolean }) => Promise<void>;
  /** Whether this admission is sealed by a terminal or generation-replacing session end. */
  isTerminal: () => boolean;
  /** Retry a disconnected transport through the provider's single retry owner. */
  reconnect: () => void;
  hasUnconfirmedLocalChanges: () => boolean;
  /** Broadcast an ephemeral floating emoji to other collaborators (never persisted). */
  broadcastEmojiReaction: (emoji: string, x: number, y: number) => void;
  broadcastCountdownTimer: (remainingSeconds: number, startedBy: string, active: boolean) => void;
};

export type CollabState = {
  collaborating: boolean;
  connecting: boolean;
  mode: CollaboratorMode | null;
  modeReason: CollaboratorModeReasons | null;
  isReadOnly: boolean;
  phase: CollaborationPhase;
  access: CollaborationAccess;
  hasEverSynced: boolean;
  hasUnconfirmedLocalChanges: boolean;
};

type UseCollabProps = {
  username: string;
  onRemoteSave?: (error?: string) => void;
  /**
   * A TRANSIENT disconnect (network/transport drop, 1011, or a `room-capacity-reached`
   * policy close) — the connection is expected to come back, so the consumer surfaces
   * non-blocking recovery status while the provider keeps retrying. A TERMINAL
   * close routes to `onTerminalClose` instead and never reaches here.
   */
  onCloseConnection: () => void;
  onSceneInitChange?: (initialized: boolean) => void;
  /**
   * The server rejected a local update — the scene is poisoned. The consumer must
   * discard this editor generation and remount a fresh one that resyncs from the
   * server (reconnecting alone would resend the rejected state).
   */
  onUpdateRejected?: () => void;
  /**
   * A TERMINAL policy close (1008 `forbidden` / `document deleted` / any unrecognised
   * 1008 reason, fail closed) — this attempt must NOT be retried. The consumer must
   * keep manual retry disabled; reconnecting would just be re-rejected. `reason`
   * is the server's close reason so the consumer can differentiate the terminal cause.
   */
  onTerminalClose?: (reason: string) => void;
  /**
   * The server ended this session (a `session-end` control) with a validated tuple. The
   * `disposition` is authoritative and decides the outcome: `transient` (the provider's own
   * scheduler reconnects — the consumer must NOT start a second loop), `terminal` (no
   * reconnect; `edits-not-saved` warrants a data-loss UX distinct from a deletion), or
   * `manual` (discard the poisoned generation now, keep collaboration + provider reconnect
   * OFF until the user explicitly starts a fresh generation). An unknown/inconsistent tuple
   * never reaches here — it fails closed to `onTerminalClose`.
   */
  onSessionEnd?: (info: SessionEndInfo) => void;
};

type InitProps = {
  excalidrawApi: ExcalidrawImperativeAPI;
  roomId: string;
};

type UseCollabProvided = [CollabAPI | null, (initProps: InitProps) => () => void, CollabState];

/** Cursor palette (mirrors the memo useUserCursor colours) for a stable per-user hue. */
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

/** Deterministic cursor colour from a display name, so a user's cursor hue is stable. */
function cursorColorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
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
 * (`/collab/<roomId>?type=whiteboard`) via `UnifiedCollabProvider`. The editor's
 * scene-sync port owns the Excalidraw scene ↔ Yjs loop (per-property CRDT merge over
 * y-protocols sync); the `AwarenessRouter` routes cursors/selection/idle to y-protocols
 * awareness and emoji/countdown to the provider's ephemeral channel — replacing the
 * legacy Socket.IO `Collab`/`Portal` element-broadcast path.
 *
 * Returns the same `[CollabAPI, initialize, CollabState]` shape the wrapper consumed
 * before, so the editor wiring is unchanged at the call site.
 */
const useCollab = ({
  username,
  onRemoteSave,
  onCloseConnection,
  onSceneInitChange,
  onUpdateRejected,
  onTerminalClose,
  onSessionEnd,
}: UseCollabProps): UseCollabProvided => {
  const providerRef = useRef<UnifiedCollabProvider | null>(null);
  const collabApiRef = useRef<CollabAPI | null>(null);
  // These facts belong to the editor scene, not to one admitted WebSocket
  // member. Inactivity Resume deliberately replaces the provider/member while
  // preserving the same Excalidraw Scene, so a provider cleanup must not erase
  // either fact. A room or poisoned-scene replacement resets them explicitly.
  const activeRoomIdRef = useRef<string | null>(null);
  const hasEverSyncedRef = useRef(false);
  const hasUnconfirmedLocalChangesRef = useRef(false);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [hasEverSynced, setHasEverSynced] = useState(false);
  const [hasUnconfirmedLocalChanges, setHasUnconfirmedLocalChanges] = useState(false);
  const [terminal, setTerminal] = useState(false);
  const [replaceGeneration, setReplaceGeneration] = useState(false);
  const [collaboratorMode, setCollaboratorMode] = useState<CollaboratorMode | null>(null);
  const [collaboratorModeReason, setCollaboratorModeReason] = useState<CollaboratorModeReasons | null>(null);

  const initialize = ({ excalidrawApi, roomId }: InitProps): (() => void) => {
    const preservesScene = activeRoomIdRef.current === roomId;
    if (!preservesScene) {
      activeRoomIdRef.current = roomId;
      hasEverSyncedRef.current = false;
      hasUnconfirmedLocalChangesRef.current = false;
      setHasEverSynced(false);
      setHasUnconfirmedLocalChanges(false);
    }
    // Native-Yjs core: the editor's `Scene` IS the `Y.Doc`, but the provider drives
    // whiteboard sync through the editor's scene-sync port (the four v1 methods)
    // instead of subscribing to the raw doc. The editor enforces its own origin
    // policy (a remote apply is never echoed back), and the raw doc stays private.
    const provider = new UnifiedCollabProvider({
      documentId: roomId,
      type: 'whiteboard',
      scenePort: {
        encodeSceneStateVector: () => excalidrawApi.encodeSceneStateVector(),
        encodeSceneAsUpdate: (format, targetStateVector) =>
          excalidrawApi.encodeSceneAsUpdate(format, targetStateVector),
        applyRemoteSceneUpdate: (update, format) => excalidrawApi.applyRemoteSceneUpdate(update, format),
        onLocalSceneUpdate: (cb, format) => excalidrawApi.onLocalSceneUpdate(cb, format),
      },
      guestName: resolveWhiteboardGuestIdentity().guestName,
      connect: false,
      initialUnconfirmedLocalChanges: preservesScene && hasUnconfirmedLocalChangesRef.current,
    });
    providerRef.current = provider;

    // Announce identity so peers render this collaborator's cursor. The
    // AwarenessRouter reads `user.username` / `user.color` (NOT `user.name`) to
    // build the Excalidraw collaborator, so the field shape must match.
    provider.awareness.setLocalStateField('user', { username, color: cursorColorFor(username) });

    // Presence (cursors/selection/emoji/countdown) is off-doc on awareness + the
    // ephemeral channel — the editor-agnostic router ported from the deleted binding.
    const awarenessRouter = new AwarenessRouter({
      awareness: provider.awareness,
      api: excalidrawApi,
      ephemeral: provider.ephemeralChannel,
    });

    // Set when a `session-end` control has already established the authoritative
    // disposition for this connection. The socket close that follows must then be
    // idempotent for the UI/action (it must NOT re-route to a callback), though the
    // provider still completes its own socket teardown. Reset on a fresh connection.
    let sessionEndHandled = false;
    let terminalSealed = false;
    let didEverSync = preservesScene && hasEverSyncedRef.current;
    let currentMode: CollaboratorMode | null = null;

    const handleStatus = (status: 'connecting' | 'connected' | 'disconnected') => {
      // A WebSocket OPEN is not editor readiness. Keep the UI in connecting /
      // read-only state until SyncStep2 confirms this same Y.Doc has converged.
      setIsConnecting(status === 'connecting' || (status === 'connected' && !provider.synced));
      if (status === 'connected') {
        if (!terminalSealed) {
          sessionEndHandled = false; // a fresh connection: any prior transient session-end is spent
          setTerminal(false);
        }
      } else if (status === 'disconnected') {
        setIsCollaborating(false);
        // The close-reason routing (transient → onCloseConnection, terminal →
        // onTerminalClose) is driven by `handleClose` off the provider's `close`
        // verdict — NOT from here — so a terminal policy close never opens the
        // retrying reconnect notice.
      }
    };

    // Reason-aware close routing: a transient drop keeps the retry loop alive via
    // onCloseConnection; a terminal policy close (forbidden / document deleted /
    // unrecognised 1008) hands off to onTerminalClose so the consumer stops
    // retrying. The provider has already decided NOT to reconnect a terminal close.
    const handleClose = (verdict: CloseVerdict) => {
      if (sessionEndHandled) {
        // A `session-end` control already established the disposition + drove the outcome;
        // the socket close must not override or duplicate it (the provider still ran its
        // own teardown / reconnect internally).
        return;
      }
      if (verdict.disposition === 'terminal') {
        terminalSealed = true;
        setTerminal(true);
        provider.disconnect();
        onTerminalClose?.(verdict.reason);
      } else if (verdict.disposition === 'transient') {
        // A transient close is retryable; the provider's single scheduler keeps going.
        onCloseConnection();
      }
    };

    // Fit-to-content fires exactly ONCE per editor generation, on the first completed
    // scene sync — never on a later resync/reconnect.
    let didInitialFit = false;
    const handleSynced = (synced: boolean) => {
      setIsCollaborating(synced);
      setIsConnecting(!synced && provider.status !== 'disconnected');
      if (!synced) {
        return;
      }
      const isRecoverySync = didEverSync;
      didEverSync = true;
      hasEverSyncedRef.current = true;
      setHasEverSynced(true);
      onSceneInitChange?.(true);
      // Absence of a read-only/mode downgrade by the time the initial sync completes IS
      // the write grant — the service never sends `collaborator-mode` at join, only on a
      // later inactivity downgrade. The functional update keeps a mode a viewer
      // `read-only-state` already set (FIFO-safe: a read-only frame that arrived first
      // wins), and only fills in the default `write` when no downgrade has been seen.
      if (currentMode === null) currentMode = 'write';
      setCollaboratorMode(previous => previous ?? 'write');
      if (isRecoverySync && currentMode === 'write' && provider.hasUnconfirmedLocalChanges) {
        void provider.requestDurability().catch(() => {});
      }
      // The Yjs scene-sync restores elements but NOT viewport scroll/zoom, so without an
      // initial fit the editor opens at (0,0) showing blank canvas for a drawing placed
      // away from the origin. Mirror the single-user path (ExcalidrawWrapper), which
      // scrolls-to-content after seeding — but only on the initial sync of this editor.
      if (!didInitialFit) {
        didInitialFit = true;
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
          onRemoteSave?.();
          break;
        case 'save-error':
          onRemoteSave?.(message.error ?? 'save-error');
          break;
        case 'collaborator-mode':
          currentMode = message.mode === 'write' ? 'write' : 'read';
          setCollaboratorMode(currentMode);
          setCollaboratorModeReason(toModeReason(message.reason));
          break;
        case 'read-only-state':
          // A read-only downgrade also rides on read-only-state; reflect it as the
          // collaborator mode so the editor toggles view-mode.
          currentMode = message.readOnly ? 'read' : 'write';
          setCollaboratorMode(currentMode);
          if (message.reason) setCollaboratorModeReason(toModeReason(message.reason));
          break;
        case 'update-rejected':
          // The server rejected this generation's local update; hand off to the
          // consumer to discard the poisoned scene and remount a fresh generation
          // that resyncs from the server. Reconnecting this provider would resend it.
          setReplaceGeneration(true);
          hasEverSyncedRef.current = false;
          hasUnconfirmedLocalChangesRef.current = false;
          setHasEverSynced(false);
          setHasUnconfirmedLocalChanges(false);
          onSceneInitChange?.(false);
          onUpdateRejected?.();
          break;
        case 'session-end': {
          // The server is ending this session. Classify against the KNOWN tuple table
          // (the authority) — never trust the wire disposition/scope on their own. The
          // control is authoritative over the socket close that follows (idempotence via
          // `sessionEndHandled`). An unknown/inconsistent tuple fails CLOSED to a terminal.
          sessionEndHandled = true;
          const info = classifySessionEnd(message);
          if (info) {
            if (info.disposition !== 'transient') {
              terminalSealed = true;
              setTerminal(true);
              if (info.disposition === 'manual') {
                hasEverSyncedRef.current = false;
                hasUnconfirmedLocalChangesRef.current = false;
                setHasEverSynced(false);
                setHasUnconfirmedLocalChanges(false);
                onSceneInitChange?.(false);
              }
              provider.disconnect();
            }
            onSessionEnd?.(info);
          } else {
            terminalSealed = true;
            setTerminal(true);
            provider.disconnect();
            onTerminalClose?.(message.code ?? 'session-end');
          }
          break;
        }
        default:
          break;
      }
    };

    const handleUnconfirmed = (unconfirmed: boolean) => {
      hasUnconfirmedLocalChangesRef.current = unconfirmed;
      setHasUnconfirmedLocalChanges(unconfirmed);
    };

    provider.on('status', handleStatus);
    provider.on('synced', handleSynced);
    provider.on('control', handleControl);
    provider.on('close', handleClose);
    provider.on('unconfirmed', handleUnconfirmed);
    hasUnconfirmedLocalChangesRef.current = provider.hasUnconfirmedLocalChanges;
    setHasUnconfirmedLocalChanges(provider.hasUnconfirmedLocalChanges);
    provider.connect();

    const collabApi: CollabAPI = {
      onPointerUpdate: payload => awarenessRouter.onPointerUpdate(payload),
      isCollaborating: () => providerRef.current?.status === 'connected' && providerRef.current.synced,
      requestDurability: () => provider.requestDurability(),
      persistPendingChanges: options => provider.persistPendingChanges(options),
      isTerminal: () => terminalSealed,
      reconnect: () => provider.reconnectNow(),
      hasUnconfirmedLocalChanges: () => provider.hasUnconfirmedLocalChanges,
      broadcastEmojiReaction: (emoji, x, y) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        awarenessRouter.broadcastEmojiReaction({ id, emoji, x, y });
      },
      broadcastCountdownTimer: (remainingSeconds, startedBy, active) => {
        awarenessRouter.broadcastCountdownTimer({ remainingSeconds, startedBy, active });
      },
    };
    collabApiRef.current = collabApi;

    return () => {
      provider.off('status', handleStatus);
      provider.off('synced', handleSynced);
      provider.off('control', handleControl);
      provider.off('close', handleClose);
      provider.off('unconfirmed', handleUnconfirmed);
      awarenessRouter.destroy();
      provider.destroy();
      providerRef.current = null;
      collabApiRef.current = null;
      setIsCollaborating(false);
      setTerminal(false);
      setReplaceGeneration(false);
      setCollaboratorMode(null);
      setCollaboratorModeReason(null);
    };
  };

  const { phase, access } = deriveCollaborationState({
    status: isConnecting ? 'connecting' : isCollaborating ? 'connected' : 'disconnected',
    synced: isCollaborating,
    hasEverSynced,
    readOnly: collaboratorMode === 'read',
    terminal,
    replaceGeneration,
  });

  return [
    collabApiRef.current,
    initialize,
    {
      connecting: isConnecting,
      // "Collaborating" means the provider completed Yjs sync, not merely that the
      // WebSocket opened. Collaborator mode remains a separate concern surfaced via
      // `mode` / `isReadOnly`.
      collaborating: isCollaborating,
      mode: collaboratorMode,
      modeReason: collaboratorModeReason,
      isReadOnly: access === 'readOnly' || phase === 'initial' || phase === 'terminal' || phase === 'replaceGeneration',
      phase,
      access,
      hasEverSynced,
      hasUnconfirmedLocalChanges,
    },
  ];
};

export default useCollab;
