import { type RefObject, useCallback, useEffect, useState } from 'react';
import {
  type CollaboraConnectionState,
  type CollaboraConnectionStatus,
  type DisconnectCause,
  useCollaboraPostMessage,
} from './useCollaboraPostMessage';

/**
 * Silence-based network-drop detection threshold (ms). Explicit signals (Collabora error /
 * session-closed, the `offline` event, token expiry) surface immediately; this bounds how
 * long unexplained quiet is tolerated before declaring a disconnect (FR-014 / SC-001).
 */
export const DISCONNECT_DETECT_MS = 5000;

/**
 * Bounded window a *transient* drop (network blip, rejoin-able service error) is given for
 * the editor's own reconnection to self-heal before manual recovery is offered (FR-009 /
 * SC-006). Consumed by the US3 `reconnecting` refinement; defined here as the single home
 * for the monitor's timing constants.
 */
export const SELF_HEAL_WINDOW_MS = 20000;

type Options = {
  /** WOPI access-token lifetime (ms) from the editor-URL query; arms the expiry timer. */
  accessTokenTTL?: number;
  /**
   * Forces the `terminal` state — set by the overlay when a reconnect attempt returned a
   * non-recoverable error (document deleted → not-found, or access revoked → forbidden).
   * A terminal session offers no retry (FR-013).
   */
  terminal?: boolean;
  onError?: (message: string) => void;
  onSessionClosed?: () => void;
};

/**
 * Fuses the raw Collabora postMessage signals (`useCollaboraPostMessage`) with two signals
 * Collabora itself does NOT reliably provide, to detect a dropped editing session:
 *
 * - **Browser transport** (`navigator.onLine` + `online`/`offline`) — the reliable signal
 *   for a network drop. Collabora's postMessage transport state is unreliable: pulling the
 *   cable keeps the iframe reporting "connected", so we must not depend on it here.
 * - **Token expiry** — a client-side timer from `accessTokenTTL`. An expired WOPI token is
 *   an *invisible* failure: saves start returning 401 with no Collabora signal, so we
 *   predict expiry from the TTL and surface it (straight to `disconnected` — a token can
 *   only be refreshed by a remount, never by the editor self-healing).
 *
 * Increment 1 (US1): detection + honest status. Increment 2 (US2) adds `reconnect()` — a
 * user-initiated in-place recovery that re-issues a fresh token and remounts the iframe (the
 * editor keys on `reconnectNonce`) — plus the forced `terminal` state. The `reconnecting`
 * self-heal window (US3) is layered on later.
 */
export function useCollaboraConnectionMonitor(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  { accessTokenTTL, terminal, onError, onSessionClosed }: Options = {}
): CollaboraConnectionState {
  const base = useCollaboraPostMessage(iframeRef, { onError, onSessionClosed });

  const [reconnectNonce, setReconnectNonce] = useState(0);
  const reconnect = useCallback(() => setReconnectNonce(n => n + 1), []);

  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Re-armed on every reconnect (nonce change) — a fresh token restarts the expiry clock even
  // when the TTL value is unchanged (it's a constant ~8h), so the effect can't depend on the
  // TTL value alone.
  const [tokenExpired, setTokenExpired] = useState(false);
  useEffect(() => {
    setTokenExpired(false);
    if (!accessTokenTTL || accessTokenTTL <= 0) return;
    const id = setTimeout(() => setTokenExpired(true), accessTokenTTL);
    return () => clearTimeout(id);
  }, [accessTokenTTL, reconnectNonce]);

  let status: CollaboraConnectionStatus = base.connectionStatus;
  let cause: DisconnectCause | null = null;

  if (terminal) {
    // Non-recoverable (document gone / access revoked) — no retry (FR-013).
    status = 'terminal';
    cause = 'service';
  } else if (tokenExpired) {
    // Not transient — bypasses any self-heal window; only a remount mints a new token.
    status = 'disconnected';
    cause = 'tokenExpiry';
  } else if (!online) {
    status = 'disconnected';
    cause = 'network';
  } else if (base.connectionStatus === 'disconnected') {
    // Collabora reported Session_Closed / an Error while the browser is otherwise online.
    status = 'disconnected';
    cause = 'service';
  }

  return {
    status,
    cause,
    saveStatus: base.saveStatus,
    connectedUsers: base.connectedUsers,
    accessTokenTTL,
    lastError: base.lastError,
    reconnect,
    reconnectNonce,
  };
}
