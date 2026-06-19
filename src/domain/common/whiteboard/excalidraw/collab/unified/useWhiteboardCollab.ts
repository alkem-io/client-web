import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { type BindingExcalidrawAPI, type SceneJSON, WhiteboardBinding } from '@alkemio/excalidraw-yjs-binding';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
import { type ControlMessage, readOnlyReasonToCode } from '@/core/collab/controlMessage';
import { UnifiedCollabProvider } from '@/core/collab/UnifiedCollabProvider';
import { error as logError, TagCategoryValues } from '@/core/logging/sentry/log';
import type { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import { env } from '@/main/env';
import { createEphemeralChannel } from './ephemeralChannel';

/**
 * Resolve the unified collaboration-service base URL for whiteboards, mirroring
 * the memo hook's `getCollaborationServiceUrl`. Both content types share one
 * service (`/collab/<documentId>?type=<contentType>`); whiteboards use the
 * `VITE_APP_COLLAB_*` env pair (memos use `VITE_APP_COLLAB_DOC_*`). Full env
 * consolidation to a single base URL is a cleanup follow-up (T005.3).
 */
const getWhiteboardCollabUrl = (): string | null => {
  const baseUrl = env?.VITE_APP_COLLAB_URL;
  const path = env?.VITE_APP_COLLAB_PATH;

  if (!baseUrl) {
    logError('Whiteboard collaboration service URL not configured', {
      category: TagCategoryValues.WHITEBOARD,
      label: `url: ${env?.VITE_APP_COLLAB_URL}; path: ${env?.VITE_APP_COLLAB_PATH}`,
    });
    return null;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path?.startsWith('/') ? path : `/${path ?? ''}`;
  return `${normalizedBase}${normalizedPath}`;
};

export type WhiteboardCollabUser = {
  id?: string;
  username: string;
  color?: string;
  avatarUrl?: string;
};

export interface UseWhiteboardCollabProps {
  /** The whiteboard id → `/collab/<whiteboardId>?type=whiteboard`. */
  whiteboardId?: string;
  /** Local user identity written to awareness for presence/cursors. */
  user: WhiteboardCollabUser;
  /** Optional public-whiteboard guest name carried on the WS handshake (FR-010). */
  guestName?: string;
  /** Initial scene to seed an empty doc (first open / migration). */
  initialScene?: SceneJSON;
  /** Persist outcome from the server control channel (`saved` / `save-error`). */
  onRemoteSave?: (error?: string) => void;
  /** Connection dropped (server `room-closed` or transport close). */
  onCloseConnection?: () => void;
  /** Optional WebSocket implementation override (tests inject a mock). */
  WebSocketPolyfill?: typeof WebSocket;
}

export type WhiteboardCollabMode = 'read' | 'write';

export interface WhiteboardCollabState {
  /** WS transport status. */
  status: 'connecting' | 'connected' | 'disconnected';
  /** True once the y-protocols sync handshake has completed at least once. */
  synced: boolean;
  /** read / write authorization delivered via the `read-only-state` control. */
  mode: WhiteboardCollabMode;
  /** Why the board is read-only, when the server supplies a reason (OPEN-1). */
  readOnlyCode?: ReadOnlyCode;
  /** True while not yet writable (connecting / not synced / viewer / no doc). */
  isReadOnly: boolean;
  /** Current connected-user count (server `room-user-change`, cross-check). */
  userCount: number;
  /** Server-acknowledged save version (control `saved`). */
  lastSaveVersion?: number;
}

export interface WhiteboardCollabApi {
  /** The shared scene `Y.Doc`, bound to the editor by the WhiteboardBinding. */
  doc: Y.Doc;
  provider: UnifiedCollabProvider | null;
  binding: WhiteboardBinding | null;
  /** Attach the Excalidraw imperative API; creates + wires the binding. */
  onExcalidrawAPI: (api: ExcalidrawImperativeAPI | null) => void;
  /** Route a local pointer move to awareness (presence, never the doc). */
  onPointerUpdate: (payload: {
    pointer: { x: number; y: number; tool?: 'pointer' | 'laser' } | null;
    button: 'up' | 'down';
  }) => void;
  /** Broadcast a floating emoji reaction via the ephemeral channel. */
  broadcastEmojiReaction: (emoji: string, x: number, y: number) => void;
  /** Broadcast countdown-timer state via the ephemeral channel. */
  broadcastCountdownTimer: (remainingSeconds: number, startedBy: string, active: boolean) => void;
}

/**
 * Unified whiteboard collaboration hook (WS-D / US1). The Excalidraw analogue of
 * the memo `useCollaboration`: it owns one `UnifiedCollabProvider`
 * (`type=whiteboard` + the whiteboard id) and wires the per-property
 * `@alkemio/excalidraw-yjs-binding` to the provider's `Y.Doc` + `Awareness`,
 * replacing the legacy socket.io `Collab`/`Portal` scene-broadcast path.
 *
 * - **Scene** ↔ doc: the binding (id-keyed `Y.Map`), per-property merge.
 * - **Cursors / selection / idle**: awareness (type 1) via the binding's router.
 * - **Emoji / countdown / bounds**: the ephemeral channel (type 2).
 * - **saved / save-error / read-only / room state**: the control channel (type 3).
 */
export const useWhiteboardCollab = ({
  whiteboardId,
  user,
  guestName,
  initialScene,
  onRemoteSave,
  onCloseConnection,
  WebSocketPolyfill,
}: UseWhiteboardCollabProps): [WhiteboardCollabApi, WhiteboardCollabState] => {
  const doc = useMemo(() => new Y.Doc(), [whiteboardId]);
  const bindingRef = useRef<WhiteboardBinding | null>(null);
  const ephemeralChannelRef = useRef<ReturnType<typeof createEphemeralChannel> | null>(null);

  const [status, setStatus] = useState<WhiteboardCollabState['status']>('connecting');
  const [synced, setSynced] = useState(false);
  const [mode, setMode] = useState<WhiteboardCollabMode>('read');
  const [readOnlyCode, setReadOnlyCode] = useState<ReadOnlyCode | undefined>(undefined);
  const [userCount, setUserCount] = useState(0);
  const [lastSaveVersion, setLastSaveVersion] = useState<number | undefined>(undefined);
  const [bindingReady, setBindingReady] = useState(false);

  // Keep the latest callbacks in refs so the provider effect does not re-run (and
  // tear down the live Y.Doc) when a parent re-renders with new closures.
  const onRemoteSaveRef = useRef(onRemoteSave);
  onRemoteSaveRef.current = onRemoteSave;
  const onCloseConnectionRef = useRef(onCloseConnection);
  onCloseConnectionRef.current = onCloseConnection;
  const initialSceneRef = useRef(initialScene);
  initialSceneRef.current = initialScene;
  const userRef = useRef(user);
  userRef.current = user;

  const provider = useMemo(() => {
    const url = getWhiteboardCollabUrl();
    if (!whiteboardId || !url) {
      return null;
    }
    return new UnifiedCollabProvider({
      url,
      documentId: whiteboardId,
      contentType: 'whiteboard',
      doc,
      guestName,
      WebSocketPolyfill,
    });
  }, [whiteboardId, doc, guestName, WebSocketPolyfill]);

  // Wire provider events + connect. Control messages map to whiteboard UX:
  // saved/save-error → onRemoteSave; read-only-state → read/write mode (+reason);
  // room-user-change → presence count; room-closed → connection teardown.
  useEffect(() => {
    if (!provider) {
      return;
    }

    const statusHandler = (event: { status: WhiteboardCollabState['status'] }) => {
      setStatus(event.status);
    };
    const syncHandler = (state: boolean) => {
      setSynced(!!state);
    };
    const connectionCloseHandler = () => {
      setSynced(false);
      onCloseConnectionRef.current?.();
    };

    const controlHandler = (msg: ControlMessage) => {
      switch (msg.kind) {
        case 'saved':
          setLastSaveVersion(msg.version);
          onRemoteSaveRef.current?.();
          break;
        case 'save-error':
          onRemoteSaveRef.current?.(msg.error ?? 'save-error');
          break;
        case 'read-only-state':
          setMode(msg.readOnly ? 'read' : 'write');
          // OPEN-1: the server `reason` maps onto the existing ReadOnlyCode; when
          // omitted (older server) the code is undefined and the UI falls back to
          // a generic read-only treatment (capacity/multi-user granularity lost).
          setReadOnlyCode(readOnlyReasonToCode(msg.reason));
          break;
        case 'room-user-change':
          if (typeof msg.users === 'number') {
            setUserCount(msg.users);
          }
          break;
        case 'room-closed':
          onCloseConnectionRef.current?.();
          break;
        default:
          // forward-compat: ignore unknown control kinds.
          break;
      }
    };

    provider.on('status', statusHandler);
    provider.on('synced', syncHandler);
    provider.on('connection-close', connectionCloseHandler);
    provider.on('connection-error', connectionCloseHandler);
    const unsubscribeControl = provider.onControl(controlHandler);

    provider.connect();

    return () => {
      unsubscribeControl();
      provider.off('status', statusHandler);
      provider.off('synced', syncHandler);
      provider.off('connection-close', connectionCloseHandler);
      provider.off('connection-error', connectionCloseHandler);
      provider.destroy();
    };
  }, [provider]);

  // Attach the Excalidraw imperative API: (re)create the binding wired to the
  // provider's Y.Doc + Awareness and the ephemeral channel. Called with `null` on
  // editor teardown (onExcalidrawAPI contract) to dispose the binding.
  const onExcalidrawAPI = useCallback(
    (api: ExcalidrawImperativeAPI | null) => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
      ephemeralChannelRef.current?.destroy();
      ephemeralChannelRef.current = null;
      setBindingReady(false);

      if (!api || !provider) {
        return;
      }

      const ephemeral = createEphemeralChannel(provider);
      ephemeralChannelRef.current = ephemeral;

      const binding = new WhiteboardBinding(doc, api as unknown as BindingExcalidrawAPI, {
        awareness: provider.awareness,
        ephemeral,
        initialScene: initialSceneRef.current,
      });
      bindingRef.current = binding;

      // Seed local presence identity (cursor name/color/avatar) in awareness.
      binding.awarenessRouter?.setUser({
        id: userRef.current.id,
        username: userRef.current.username,
        color: userRef.current.color,
        avatarUrl: userRef.current.avatarUrl,
      });

      setBindingReady(true);
    },
    [doc, provider]
  );

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
      ephemeralChannelRef.current?.destroy();
      ephemeralChannelRef.current = null;
    };
  }, []);

  const onPointerUpdate = useCallback<WhiteboardCollabApi['onPointerUpdate']>(payload => {
    bindingRef.current?.awarenessRouter?.onPointerUpdate(payload);
  }, []);

  const broadcastEmojiReaction = useCallback<WhiteboardCollabApi['broadcastEmojiReaction']>((emoji, x, y) => {
    bindingRef.current?.awarenessRouter?.broadcastEmojiReaction({
      id: `${Date.now()}-${Math.round(x)}-${Math.round(y)}`,
      emoji,
      x,
      y,
    });
  }, []);

  const broadcastCountdownTimer = useCallback<WhiteboardCollabApi['broadcastCountdownTimer']>(
    (remainingSeconds, startedBy, active) => {
      bindingRef.current?.awarenessRouter?.broadcastCountdownTimer({ remainingSeconds, startedBy, active });
    },
    []
  );

  const isReadOnly = status !== 'connected' || !synced || !bindingReady || mode === 'read';

  const api: WhiteboardCollabApi = {
    doc,
    provider,
    binding: bindingRef.current,
    onExcalidrawAPI,
    onPointerUpdate,
    broadcastEmojiReaction,
    broadcastCountdownTimer,
  };

  const state: WhiteboardCollabState = {
    status,
    synced,
    mode,
    readOnlyCode,
    isReadOnly,
    userCount,
    lastSaveVersion,
  };

  return [api, state];
};

export { getWhiteboardCollabUrl };
