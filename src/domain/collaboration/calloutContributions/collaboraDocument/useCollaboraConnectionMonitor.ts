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
 * Increment 1 (US1): detection + honest status. Increment 2 (US2): `reconnect()` — a
 * user-initiated in-place recovery that re-issues a fresh token and remounts the iframe (the
 * editor keys on `reconnectNonce`) — plus the forced `terminal` state. Increment 3 (US3): a
 * bounded `reconnecting` self-heal window for transient network drops, background/focus
 * re-sync (FR-011), and the false-positive guarantee that mere silence is never a disconnect.
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

  // Re-evaluate transport state when the tab regains focus/visibility — a backgrounded or slept
  // tab may have missed online/offline events, so reflect reality rather than a stale value
  // (FR-011). The token-expiry timer below fires on wake for the same reason.
  useEffect(() => {
    const resync = () => setOnline(typeof navigator === 'undefined' ? true : navigator.onLine);
    document.addEventListener('visibilitychange', resync);
    window.addEventListener('focus', resync);
    return () => {
      document.removeEventListener('visibilitychange', resync);
      window.removeEventListener('focus', resync);
    };
  }, []);

  // `accessTokenTTL` is an ABSOLUTE expiry — ms since the Unix epoch (per the WOPI spec), NOT a
  // duration — so we schedule from the remaining time (`expiry - now`). Feeding the raw absolute
  // value to setTimeout would overflow its ~24.8-day cap and fire almost immediately.
  //
  // This timer is only a FALLBACK. The primary path refreshes the token *in place* before it
  // expires, via Collabora's `App_TokenExpiring` → `Reset_Access_Token` handshake (see
  // `useCollaboraTokenRefresh`); a successful refresh pushes a new `accessTokenTTL` that re-arms
  // this timer. It fires only if that refresh never happened or failed.
  const [tokenExpired, setTokenExpired] = useState(false);
  useEffect(() => {
    setTokenExpired(false);
    if (!accessTokenTTL || accessTokenTTL <= 0) return;
    const msUntilExpiry = accessTokenTTL - Date.now();
    if (msUntilExpiry <= 0) {
      setTokenExpired(true);
      return;
    }
    const id = setTimeout(() => setTokenExpired(true), msUntilExpiry);
    return () => clearTimeout(id);
  }, [accessTokenTTL, reconnectNonce]);

  // A network drop is *transient* — the editor's own reconnection can heal it when the browser
  // comes back online — so it enters the soft `reconnecting` state for a bounded self-heal
  // window before escalating to a hard `disconnected`. An explicit Collabora close (`service`)
  // won't self-reopen, and token expiry needs a new token, so both skip the window.
  const isNetworkTransient = !terminal && !tokenExpired && !online;
  const [selfHealElapsed, setSelfHealElapsed] = useState(false);
  useEffect(() => {
    if (!isNetworkTransient) {
      setSelfHealElapsed(false);
      return;
    }
    const id = setTimeout(() => setSelfHealElapsed(true), SELF_HEAL_WINDOW_MS);
    return () => clearTimeout(id);
  }, [isNetworkTransient]);

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
  } else if (isNetworkTransient) {
    // Reconnecting while the self-heal window runs; hard-disconnected only once it elapses. The
    // app NEVER auto-remounts — recovery stays user-initiated (FR-009).
    status = selfHealElapsed ? 'disconnected' : 'reconnecting';
    cause = 'network';
  } else if (base.connectionStatus === 'disconnected') {
    // Collabora reported Session_Closed / an Error while the browser is otherwise online — an
    // explicit close, so straight to disconnected (manual reconnect).
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
