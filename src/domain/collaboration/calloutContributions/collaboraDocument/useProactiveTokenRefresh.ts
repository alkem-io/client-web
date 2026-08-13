import { useEffect, useRef, useState } from 'react';

/**
 * How much token life must remain when we refresh. Collabora shows its own native "your session
 * will expire" dialog once the token has **~15 minutes** of life left (confirmed empirically), a
 * *fixed* lead regardless of the token's total TTL. To keep that dialog from ever appearing we
 * refresh — resetting the token clock — while MORE than that remains, i.e. this lead must exceed
 * Collabora's ~15-min warning window.
 *
 * For a normal 8h token this fires ~once, only in a marathon session (and most sessions end
 * before it, so no refresh happens at all). A token whose whole TTL is shorter than this lead
 * cannot be refreshed before Collabora's warning — it is left to the fallback disconnect (and is
 * only ever a test artifact; real tokens are hours long).
 */
export const REFRESH_LEAD_MS = 20 * 60_000; // 20 min — safely above Collabora's ~15-min warning

/**
 * If the document is unsaved when the refresh comes due, wait this long for Collabora's autosave
 * so no edit is dropped — but not so long we slip past the warning window (the lead above leaves
 * ~5 min of headroom, far more than this).
 */
export const SAVED_WAIT_MAX_MS = 60_000; // 1 min

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
 * **proactively, before Collabora's expiry warning fires** — because (verified against a live
 * session) Collabora emits NO postMessage when a token nears expiry; it just shows its own scary
 * "session will expire — please save and reload" dialog once ~15 min of life remain. So the host
 * must drive the refresh itself, and must do it *before* that ~15-min mark.
 *
 * Refresh = an in-place remount (re-key the iframe → `network-only` editor-URL refetch → fresh
 * per-actor token). To avoid dropping unsaved edits, the remount waits for the next moment the
 * document reports **saved** (piggybacking Collabora's own autosave — a signal we DO receive),
 * bounded so it never slips past the warning window. The result: token expiry never reaches the
 * user — no dialog, no data loss, no re-login — at the cost of a brief editor reload.
 */
export function useProactiveTokenRefresh({ accessTokenTTL, saved, reconnectNonce, onRefresh }: Params): void {
  const [due, setDue] = useState(false);
  // Latest-callback ref so the timer effects don't re-run (and re-arm) on every render.
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  // Arm the proactive timer: fire once the remaining lifetime drops to REFRESH_LEAD_MS. Re-armed
  // on each token (re)issue (accessTokenTTL changes) and each remount (reconnectNonce).
  useEffect(() => {
    setDue(false);
    if (!accessTokenTTL || accessTokenTTL <= 0) return;
    const delay = accessTokenTTL - Date.now() - REFRESH_LEAD_MS;
    // A token whose remaining life is already within the lead can't be refreshed before
    // Collabora's warning — leave it to the fallback disconnect rather than remount-looping.
    if (delay <= 0) return;
    const id = setTimeout(() => setDue(true), delay);
    return () => clearTimeout(id);
  }, [accessTokenTTL, reconnectNonce]);

  // Once due, remount at the next saved moment so no unsaved edit is dropped; if the document
  // stays unsaved, remount anyway after a bounded grace (still well before the warning).
  useEffect(() => {
    if (!due) return;
    if (saved) {
      onRefreshRef.current();
      return;
    }
    const id = setTimeout(() => onRefreshRef.current(), SAVED_WAIT_MAX_MS);
    return () => clearTimeout(id);
  }, [due, saved]);
}
