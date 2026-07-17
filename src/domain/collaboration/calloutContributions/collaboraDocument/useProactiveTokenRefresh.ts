import { useEffect, useRef, useState } from 'react';

/**
 * Fraction of the token's remaining lifetime that must elapse before we refresh. At 0.5 the
 * refresh fires at the *midpoint* of the token's life — i.e. half the lifetime BEFORE expiry.
 *
 * Collabora warns the user with its own native "your session will expire" dialog only a few
 * *minutes* before expiry; firing at the midpoint (hours before, for a normal 8h token; minutes
 * before, for a short one) always beats that dialog by construction, regardless of Collabora's
 * exact threshold — which it does not expose. Small enough that even a short test token (17m →
 * ~8.5m) refreshes well before the warning.
 */
export const TOKEN_REFRESH_FRACTION = 0.5;

type Params = {
  /** Current token's expiry as an absolute epoch (ms); the refresh is timed from this. */
  accessTokenTTL?: number;
  /** Whether the document is currently persisted — we only remount at a saved moment. */
  saved: boolean;
  /** Bumped on every remount; re-arms the timer against the freshly-issued token. */
  reconnectNonce: number;
  /** Triggers the in-place remount that mints a fresh token (the monitor's `reconnect`). */
  onRefresh: () => void;
};

/**
 * Keeps a Collabora editing session alive across WOPI token expiry by refreshing the token
 * **proactively, before it expires** — because (verified against a live session) Collabora emits
 * NO postMessage when a token is about to expire; it just shows its own scary "session will
 * expire — please save and reload" dialog. So the host must drive the refresh itself.
 *
 * Refresh = an in-place remount (re-key the iframe → `network-only` editor-URL refetch → fresh
 * per-actor token). To avoid dropping unsaved edits, the remount waits for the next moment the
 * document reports **saved** (piggybacking Collabora's own autosave — a signal we DO receive),
 * bounded so it never waits past a safe point before expiry. The result: token expiry never
 * reaches the user — no dialog, no data loss, no re-login — at the cost of a brief editor reload
 * (~once per several hours for a normal token).
 */
export function useProactiveTokenRefresh({ accessTokenTTL, saved, reconnectNonce, onRefresh }: Params): void {
  const [due, setDue] = useState(false);
  // Latest-value refs so the timer effects don't re-run (and re-arm) on every render — the
  // callback and TTL are read at fire time, not baked into effect deps.
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;
  const ttlRef = useRef(accessTokenTTL);
  ttlRef.current = accessTokenTTL;

  // Arm the proactive timer: fire once TOKEN_REFRESH_FRACTION of the remaining lifetime elapses.
  // Re-armed on each token (re)issue (accessTokenTTL changes) and each remount (reconnectNonce).
  useEffect(() => {
    setDue(false);
    if (!accessTokenTTL || accessTokenTTL <= 0) return;
    const remaining = accessTokenTTL - Date.now();
    if (remaining <= 0) return; // already expired — the monitor's fallback disconnect owns this
    const id = setTimeout(() => setDue(true), remaining * TOKEN_REFRESH_FRACTION);
    return () => clearTimeout(id);
  }, [accessTokenTTL, reconnectNonce]);

  // Once due, remount at the next saved moment so no unsaved edit is dropped; if the document
  // stays unsaved, remount anyway before expiry (bounded to half the still-remaining life).
  useEffect(() => {
    if (!due) return;
    if (saved) {
      onRefreshRef.current();
      return;
    }
    const remaining = ttlRef.current ? ttlRef.current - Date.now() : 0;
    const id = setTimeout(() => onRefreshRef.current(), Math.max(0, remaining / 2));
    return () => clearTimeout(id);
  }, [due, saved]);
}
