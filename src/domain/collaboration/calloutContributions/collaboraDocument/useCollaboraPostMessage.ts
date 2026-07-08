import { type RefObject, useEffect, useState } from 'react';
import type { CollaboraConnectedUser, CollaboraSaveStatus } from '@/crd/components/collabora/CollaboraCollabFooter';

export type CollaboraConnectionStatus = 'connected' | 'connecting' | 'disconnected';

type CollaboraMessage = {
  MessageId?: string;
  Values?: Record<string, unknown>;
};

type CollaboraView = {
  ViewId?: number | string;
  UserId?: number | string;
  UserName?: string;
  Color?: string;
  ReadOnly?: boolean;
};

export type CollaboraIframeState = {
  connectionStatus: CollaboraConnectionStatus;
  saveStatus: CollaboraSaveStatus;
  connectedUsers: CollaboraConnectedUser[];
  /**
   * Whether the current user has the document open **read-only**, as reported by
   * Collabora (per-view `ReadOnly` in `Views_List`). `undefined` until Collabora
   * reports it — callers should treat `false` (not merely "not true") as the
   * signal that the user can edit.
   */
  isReadOnly?: boolean;
  lastError?: string;
};

type Options = {
  onError?: (message: string) => void;
  onSessionClosed?: () => void;
  /** The current user's id, used to find their own view in `Views_List` to read its read-only flag. */
  currentUserId?: string;
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
  { onError, onSessionClosed, currentUserId }: Options = {}
): CollaboraIframeState {
  const [state, setState] = useState<CollaboraIframeState>({
    connectionStatus: 'connecting',
    saveStatus: 'saved',
    connectedUsers: [],
  });

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // Only accept messages coming from this iframe's own contentWindow — the editor
      // URL host varies per deployment, so origin matching alone would require runtime config.
      const iframe = iframeRef.current;
      if (!iframe || event.source !== iframe.contentWindow) return;

      const data = parseMessage(event.data);
      if (!data?.MessageId) return;

      setState(prev => reduce(prev, data, { onError, onSessionClosed, currentUserId }));
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [iframeRef, onError, onSessionClosed, currentUserId]);

  return state;
}

function parseMessage(raw: unknown): CollaboraMessage | null {
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null ? (parsed as CollaboraMessage) : null;
    } catch {
      return null;
    }
  }
  if (typeof raw === 'object' && raw !== null) {
    return raw as CollaboraMessage;
  }
  return null;
}

function reduce(
  prev: CollaboraIframeState,
  msg: CollaboraMessage,
  { onError, onSessionClosed, currentUserId }: Options
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
      // Identify the current user's own view to read its read-only flag: prefer an
      // exact UserId match, else the sole view when the user is alone in the document.
      // Leave `isReadOnly` untouched when we can't confidently identify the own view.
      const ownView =
        (currentUserId ? views.find(v => String(v.UserId) === currentUserId) : undefined) ??
        (views.length === 1 ? views[0] : undefined);
      const isReadOnly = typeof ownView?.ReadOnly === 'boolean' ? ownView.ReadOnly : prev.isReadOnly;
      return { ...prev, connectedUsers, isReadOnly };
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
