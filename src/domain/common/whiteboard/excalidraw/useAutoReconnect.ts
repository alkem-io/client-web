import { useEffect, useRef, useState } from 'react';

/**
 * Auto-reconnect backoff, in seconds. The first retry fires 5s after the connection drops, then 10s,
 * then 30s, then 60s for that attempt and every subsequent one until the connection is restored.
 */
const BACKOFF_SECONDS = [5, 10, 30, 60] as const;

const backoffSecondsFor = (attempt: number): number => BACKOFF_SECONDS[Math.min(attempt, BACKOFF_SECONDS.length - 1)];

type UseAutoReconnectParams = {
  /** Lost the connection and should keep retrying (disconnect notice open and not yet collaborating). */
  active: boolean;
  /** Browser connectivity. While offline the countdown is paused — there is nothing to reconnect to. */
  isOnline: boolean;
  /** A reconnect attempt is currently in flight (the socket is connecting). */
  connecting: boolean;
  /** Called when the countdown reaches zero — must trigger a fresh connection attempt. */
  onReconnect: () => void;
};

/**
 * Drives the whiteboard auto-reconnect countdown and backoff in one place.
 *
 * While `active` and online, it counts a backoff interval down to zero (5s, then 10s, 30s, 60s, 60s…)
 * and then calls `onReconnect`. Each elapsed-but-failed attempt advances the backoff one step; a
 * successful reconnect — signalled by `active` going `false` — resets it back to the first step. The
 * countdown is paused (and `secondsRemaining` is `null`) while an attempt is connecting and while the
 * browser is offline.
 *
 * `secondsRemaining` is the live value to render: a positive integer while counting, `null` otherwise.
 */
export const useAutoReconnect = ({ active, isOnline, connecting, onReconnect }: UseAutoReconnectParams) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const attemptRef = useRef(0);

  // Always fire the latest callback without re-subscribing the interval on every render.
  const onReconnectRef = useRef(onReconnect);
  onReconnectRef.current = onReconnect;

  // Reconnected (or notice dismissed) → reset the backoff so the next drop starts again at 5s.
  useEffect(() => {
    if (!active) {
      attemptRef.current = 0;
    }
  }, [active]);

  useEffect(() => {
    // Only count down while disconnected, online, and not already mid-attempt.
    if (!active || !isOnline || connecting) {
      setSecondsRemaining(null);
      return;
    }

    const targetAt = Date.now() + backoffSecondsFor(attemptRef.current) * 1000;
    const remainingNow = () => Math.max(0, Math.ceil((targetAt - Date.now()) / 1000));

    setSecondsRemaining(remainingNow());

    const interval = window.setInterval(() => {
      const remaining = remainingNow();
      if (remaining <= 0) {
        window.clearInterval(interval);
        // Drop straight to null (never surface a "0s") and fire the attempt. Advancing the backoff
        // here means the next attempt waits longer; a successful reconnect resets it via the effect above.
        setSecondsRemaining(null);
        attemptRef.current += 1;
        onReconnectRef.current();
        return;
      }
      setSecondsRemaining(remaining);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [active, isOnline, connecting]);

  return { secondsRemaining };
};
