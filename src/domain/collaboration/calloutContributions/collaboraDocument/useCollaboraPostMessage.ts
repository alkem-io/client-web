import { type RefObject, useEffect, useRef, useState } from 'react';
import type { CollaboraConnectedUser, CollaboraSaveStatus } from '@/crd/components/collabora/CollaboraCollabFooter';
import { type CollaboraMessage, isMessageFromIframe, parseCollaboraMessage } from './collaboraPostMessage';

export type CollaboraConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'terminal';

/**
 * Why an editing session dropped. `network` = the browser went offline; `tokenExpiry` = the
 * per-actor WOPI access token reached its TTL (saves would start failing silently — see
 * `useCollaboraConnectionMonitor`); `service` = Collabora reported an error / closed the
 * session; `unloading` = the document couldn't be (re)opened because Collabora is still
 * closing a previous session for it (`cmd=load kind=docunloading`, typically after the WOPI
 * host was briefly unreachable mid-edit) — a retry succeeds once that finishes; `unknown` =
 * detected via sustained silence with no more specific signal.
 */
export type DisconnectCause = 'network' | 'tokenExpiry' | 'service' | 'unloading' | 'unknown';

/**
 * The composite connection state produced by `useCollaboraConnectionMonitor` — the raw
 * postMessage signals (this hook) fused with the browser online/offline state and the
 * client-side token-expiry timer. Consumed by the footer mapper and the editor overlay.
 */
export type CollaboraConnectionState = {
  status: CollaboraConnectionStatus;
  /** Set when `status` is `reconnecting` | `disconnected` | `terminal`; otherwise null. */
  cause: DisconnectCause | null;
  saveStatus: CollaboraSaveStatus;
  connectedUsers: CollaboraConnectedUser[];
  /** WOPI access-token lifetime (ms) as last returned by the editor-URL query, if known. */
  accessTokenTTL?: number;
  lastError?: string;
  /** Trigger an in-place recovery: re-issue a fresh editor URL/token and remount the iframe. */
  reconnect: () => void;
  /** Monotonic counter bumped by `reconnect()`; the editor keys the iframe on it to remount. */
  reconnectNonce: number;
};

type CollaboraView = {
  ViewId?: number | string;
  UserName?: string;
  Color?: string;
  ReadOnly?: boolean;
};

export type CollaboraIframeState = {
  connectionStatus: CollaboraConnectionStatus;
  saveStatus: CollaboraSaveStatus;
  connectedUsers: CollaboraConnectedUser[];
  lastError?: string;
};

type Options = {
  onError?: (message: string) => void;
  onSessionClosed?: () => void;
  /**
   * Fired when the editor re-loads the document after the initial open. After an
   * in-editor rename Collabora reconnects and re-emits App_LoadingStatus /
   * Document_Loaded (verified) WITHOUT navigating the iframe — so this postMessage,
   * not the DOM onLoad, is the reliable signal. Callers use it to re-read the name.
   */
  onDocumentReloaded?: () => void;
};

/**
 * Parses Collabora Online's postMessage API emitted from the editor iframe. Collabora's
 * save pipeline is internal to the WOPI host; the only signals the embedder gets are
 * these messages, so we translate them into a shape the footer can render.
 *
 * See https://sdk.collaboraonline.com/docs/postmessage_api.html for the full event list.
 */
export function useCollaboraPostMessage(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  { onError, onSessionClosed, onDocumentReloaded }: Options = {}
): CollaboraIframeState {
  const [state, setState] = useState<CollaboraIframeState>({
    connectionStatus: 'connecting',
    saveStatus: 'saved',
    connectedUsers: [],
  });
  // Count Document_Loaded events: the first is the initial open; any after it is a
  // reload (e.g. Collabora's reconnect after an in-editor rename).
  const loadCountRef = useRef(0);
  // Keep the callbacks in refs so the message listener can subscribe ONCE. Binding
  // them into the effect deps instead would re-subscribe on every render (the
  // callers pass fresh closures) and reset loadCountRef, breaking reload detection.
  const callbacksRef = useRef({ onError, onSessionClosed, onDocumentReloaded });
  callbacksRef.current = { onError, onSessionClosed, onDocumentReloaded };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!isMessageFromIframe(event, iframeRef.current)) return;

      const data = parseCollaboraMessage(event.data);
      if (!data?.MessageId) return;

      const { onError, onSessionClosed, onDocumentReloaded } = callbacksRef.current;
      if (data.MessageId === 'App_LoadingStatus' && data.Values?.Status === 'Document_Loaded') {
        loadCountRef.current += 1;
        if (loadCountRef.current > 1) {
          onDocumentReloaded?.();
        }
      }

      setState(prev => reduce(prev, data, { onError, onSessionClosed }));
    };

    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
      loadCountRef.current = 0;
    };
  }, [iframeRef]);

  return state;
}

function reduce(
  prev: CollaboraIframeState,
  msg: CollaboraMessage,
  { onError, onSessionClosed }: Options
): CollaboraIframeState {
  const values = msg.Values ?? {};

  switch (msg.MessageId) {
    case 'App_LoadingStatus': {
      const status = values.Status;
      if (status === 'Document_Loaded') {
        return { ...prev, connectionStatus: 'connected' };
      }
      if (status === 'Frame_Ready') {
        return { ...prev, connectionStatus: 'connecting' };
      }
      return prev;
    }
    case 'Doc_ModifiedStatus': {
      // Collabora fires Modified=false after autosave completes (and once at load time). Treat
      // it as the authoritative "saved" transition — without it, the flag stuck at 'unsaved'.
      const modified = Boolean(values.Modified);
      // A completed save (Modified=false) is authoritative and clears a prior error — otherwise a
      // one-off Collabora `Error` would latch the error chip (and the health poll) for the whole
      // session. Modified=true keeps an existing error visible rather than downgrading to 'unsaved'.
      if (!modified) return { ...prev, saveStatus: 'saved', lastError: undefined };
      if (prev.saveStatus === 'error') return prev;
      return { ...prev, saveStatus: 'unsaved' };
    }
    case 'App_Saved':
      return { ...prev, saveStatus: 'saved' };
    case 'Action_Save_Resp': {
      const success = values.success !== false;
      return { ...prev, saveStatus: success ? 'saved' : 'error' };
    }
    case 'Views_List': {
      const views = Array.isArray(values.Views) ? (values.Views as CollaboraView[]) : [];
      const connectedUsers: CollaboraConnectedUser[] = views
        .filter(v => v.UserName)
        .map(v => ({
          id: String(v.ViewId ?? v.UserName),
          name: v.UserName ?? '',
          color: normalizeColor(v.Color),
        }));
      return { ...prev, connectedUsers };
    }
    case 'Error': {
      const cmd = typeof values.Cmd === 'string' ? values.Cmd : undefined;
      const kind = typeof values.Kind === 'string' ? values.Kind : undefined;
      const message = cmd ?? 'Collabora error';
      // A `load` failure means the editing session never came up — most often the document
      // is still unloading from a previous session (`cmd=load kind=docunloading`, e.g. after
      // the WOPI host was briefly unreachable mid-edit). That is a connection drop, not a save
      // error: surface it as `disconnected` (recording the kind so the monitor can show a
      // "still closing" hint) so the recovery banner + Reconnect appear instead of an
      // indefinite "connecting…" spinner. We deliberately do NOT also raise the global error
      // toast here — the banner already communicates it, and a red "runtime error" alert would
      // be a scary, redundant interruption for what is usually a transient state (FR-003).
      if (cmd === 'load') {
        return { ...prev, connectionStatus: 'disconnected', lastError: kind ?? message };
      }
      onError?.(message);
      return { ...prev, saveStatus: 'error', lastError: message };
    }
    case 'Session_Closed':
    case 'Close_Session':
    case 'UI_Close':
      onSessionClosed?.();
      return { ...prev, connectionStatus: 'disconnected' };
    default:
      return prev;
  }
}

function normalizeColor(color: unknown): string {
  if (typeof color === 'string' && color.length > 0) {
    return color.startsWith('#') ? color : `#${color}`;
  }
  return '#6b7280';
}
