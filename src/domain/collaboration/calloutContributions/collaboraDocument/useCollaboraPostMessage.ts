import { type RefObject, useEffect, useState } from 'react';
import type { CollaboraConnectedUser, CollaboraSaveStatus } from '@/crd/components/collabora/CollaboraCollabFooter';

export type CollaboraConnectionStatus = 'connected' | 'connecting' | 'disconnected';

type CollaboraMessage = {
  MessageId?: string;
  Values?: Record<string, unknown>;
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
      // Only accept messages coming from this iframe's own contentWindow — the editor
      // URL host varies per deployment, so origin matching alone would require runtime config.
      const iframe = iframeRef.current;
      if (!iframe || event.source !== iframe.contentWindow) return;

      const data = parseMessage(event.data);
      if (!data?.MessageId) return;

      setState(prev => reduce(prev, data, { onError, onSessionClosed }));
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [iframeRef, onError, onSessionClosed]);

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
