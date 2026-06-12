import { useEffect, useRef, useState } from 'react';
import { info as sentryInfo } from '@/core/logging/sentry/log';
import useOnlineStatus from '@/core/utils/onlineStatus';
import { OnlineStatusBanner } from '@/crd/components/common/OnlineStatusBanner';

const OFFLINE_DEBOUNCE_MS = 3000; // Only show offline banner after 3 s sustained disconnection
const ONLINE_RESTORED_TIMEOUT = 6000;
const SENTRY_ONLINE_RESTORED_LS_KEY = 'lastOnlineRestoredLog';
const SENTRY_ONLINE_RESTORED_THROTTLE_MS = 30 * 1000; // 30 seconds

type NotificationState = 'idle' | 'offline' | 'restored';

/**
 * Tracks browser online/offline events and shows a non-intrusive CRD banner:
 * - Offline  → persistent banner, grey text, top-center (debounced — only after 3 s sustained).
 *   Not user-dismissable (no close button) — it clears only when connectivity returns.
 * - Restored → banner, green text, auto-dismisses after 6 s (only if offline banner was shown).
 *
 * Logs a single Sentry info event per restored-session, throttled to avoid noise.
 */
export const OnlineStatusNotification = () => {
  const isOnline = useOnlineStatus();
  const offlineShown = useRef(false);
  const offlineTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const restoredTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [state, setState] = useState<NotificationState>('idle');

  useEffect(() => {
    if (!isOnline) {
      // Debounce: only show offline banner after sustained disconnection
      offlineTimerRef.current = setTimeout(() => {
        offlineShown.current = true;
        setState('offline');
      }, OFFLINE_DEBOUNCE_MS);
      return () => clearTimeout(offlineTimerRef.current);
    }

    // Came back online — cancel pending offline banner if it hasn't fired yet
    clearTimeout(offlineTimerRef.current);

    // Only show "restored" if the offline banner was actually displayed
    if (offlineShown.current) {
      offlineShown.current = false;
      setState('restored');

      // Throttled Sentry log — at most once per 30 seconds
      try {
        const lastLog = Number(localStorage.getItem(SENTRY_ONLINE_RESTORED_LS_KEY) ?? '0');
        if (Date.now() - lastLog > SENTRY_ONLINE_RESTORED_THROTTLE_MS) {
          sentryInfo('Connection restored after offline period', { label: 'ONLINE_STATUS' });
          localStorage.setItem(SENTRY_ONLINE_RESTORED_LS_KEY, String(Date.now()));
        }
      } catch {
        // localStorage unavailable — skip silently
      }
    }
  }, [isOnline]);

  // Auto-dismiss the restored banner after the timeout (the offline banner is persistent).
  useEffect(() => {
    if (state !== 'restored') return;
    restoredTimerRef.current = setTimeout(() => setState('idle'), ONLINE_RESTORED_TIMEOUT);
    return () => clearTimeout(restoredTimerRef.current);
  }, [state]);

  if (state === 'idle') return null;

  return (
    <OnlineStatusBanner
      variant={state === 'offline' ? 'offline' : 'restored'}
      onClose={state === 'restored' ? () => setState('idle') : undefined}
    />
  );
};
