import { type RefObject, useEffect, useState } from 'react';
import type { CollaboraConnectedUser, CollaboraSaveStatus } from '@/crd/components/collabora/CollaboraCollabFooter';
import { type CollaboraMessage, isMessageFromIframe, parseCollaboraMessage } from './collaboraPostMessage';

export type CollaboraConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'terminal';

/**
 * Why an editing session dropped. `network` = the browser went offline; `tokenExpiry` = the
 * per-actor WOPI access token reached its TTL (saves would start failing silently — see
 * `useCollaboraConnectionMonitor`); `service` = Collabora reported an error / closed the
 * session; `unknown` = detected via sustained silence with no more specific signal.
 */
export type DisconnectCause = 'network' | 'tokenExpiry' | 'service' | 'unknown';

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
  { onError, onSessionClosed }: Options = {}
): CollaboraIframeState {
  const [state, setState] = useState<CollaboraIframeState>({
    connectionStatus: 'connecting',
    saveStatus: 'saved',
    connectedUsers: [],
  });

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!isMessageFromIframe(event, iframeRef.current)) return;

      const data = parseCollaboraMessage(event.data);
      if (!data?.MessageId) return;

      setState(prev => reduce(prev, data, { onError, onSessionClosed }));
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [iframeRef, onError, onSessionClosed]);

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
      if (prev.saveStatus === 'error') return prev;
      return { ...prev, saveStatus: modified ? 'unsaved' : 'saved' };
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
      const message = typeof values.Cmd === 'string' ? values.Cmd : 'Collabora error';
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
