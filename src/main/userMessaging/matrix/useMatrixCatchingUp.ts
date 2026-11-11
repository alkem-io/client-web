import { useEffect, useState, useSyncExternalStore } from 'react';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { CLIENT_SYNC } from './matrixRooms';

// Not ERROR: that is an outage, which can last indefinitely and is not "checking".
// RECONNECTING turns into ERROR after a few failed syncs, so both states here are short.
const CATCHING_UP_STATES = new Set(['CATCHUP', 'RECONNECTING']);
const SYNCED_STATES = new Set(['PREPARED', 'SYNCING']);
// The sync long-poll lasts 30s: after a shorter time away the connection was live and nothing was missed.
const MIN_HIDDEN_MS = 30_000;
const RESUME_TIMEOUT_MS = 5_000;

const noop = () => {};

/**
 * Whether the chat session may be missing messages it is about to receive:
 * the Matrix client has not finished its first sync, is catching up or
 * reconnecting, or the app has just come back to the foreground after a while
 * away and the next sync has not completed yet. The foreground window ends on
 * that sync, or after a timeout, so it never stays on.
 */
export const useMatrixCatchingUp = (): boolean => {
  const client = useMatrixClient();
  const [resuming, setResuming] = useState(false);

  const syncCatchingUp = useSyncExternalStore(
    listener => {
      if (!client) {
        return noop;
      }
      client.on(CLIENT_SYNC as never, listener as never);
      return () => client.removeListener(CLIENT_SYNC as never, listener as never);
    },
    () => {
      if (!client) {
        return false;
      }
      const state = client.getSyncState();
      return state === null || CATCHING_UP_STATES.has(state);
    },
    () => false
  );

  useEffect(() => {
    if (!client) {
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    // The client can appear while the app is already in the background, after the event that would record it.
    let hiddenAt = document.visibilityState === 'hidden' ? Date.now() : undefined;
    const stop = () => {
      clearTimeout(timer);
      setResuming(false);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        hiddenAt ??= Date.now();
        return;
      }
      const awayMs = hiddenAt === undefined ? 0 : Date.now() - hiddenAt;
      hiddenAt = undefined;
      if (awayMs < MIN_HIDDEN_MS) {
        return;
      }
      clearTimeout(timer);
      setResuming(true);
      timer = setTimeout(stop, RESUME_TIMEOUT_MS);
    };
    const onSync = (state: string) => {
      if (SYNCED_STATES.has(state)) {
        stop();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    client.on(CLIENT_SYNC as never, onSync as never);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      client.removeListener(CLIENT_SYNC as never, onSync as never);
      stop();
    };
  }, [client]);

  return syncCatchingUp || resuming;
};
