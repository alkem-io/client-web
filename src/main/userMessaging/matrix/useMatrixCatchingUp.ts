import { useEffect, useState } from 'react';
import { isAppMode } from '@/core/appMode/isAppMode';
import { useMatrixClient, useMatrixSessionEstablishing } from '@/core/matrix/activeClient';
import { CLIENT_SYNC } from './matrixRooms';
import { useMatrixSyncState } from './useMatrixSyncState';

// Not ERROR: that is an outage, which can last indefinitely and is not "checking".
// RECONNECTING turns into ERROR after a few failed syncs, so both states here are short.
const CATCHING_UP_STATES = new Set(['CATCHUP', 'RECONNECTING']);
const SYNCED_STATES = new Set(['PREPARED', 'SYNCING']);
// The sync long-poll lasts 30s: after a shorter time away nothing was missed.
const MIN_HIDDEN_MS = 30_000;
const RESUME_TIMEOUT_MS = 5_000;

/**
 * Whether the chat session may be missing messages it is about to receive:
 * the session is still being established, the Matrix client has not finished
 * its first sync, or it is catching up or reconnecting.
 *
 * In the app it also covers coming back to the foreground after a while away,
 * until the next sync completes or a timeout passes. The app's WebView is
 * suspended in the background, so its sync connection is stale on return while
 * the client still reports itself synced. A browser tab keeps syncing in the
 * background and needs no such window.
 */
export const useMatrixCatchingUp = (): boolean => {
  const client = useMatrixClient();
  const establishing = useMatrixSessionEstablishing();
  const syncState = useMatrixSyncState(client);
  const [resuming, setResuming] = useState(false);

  useEffect(() => {
    if (!client || !isAppMode()) {
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

  if (!client) {
    return establishing;
  }
  return syncState === null || CATCHING_UP_STATES.has(syncState) || resuming;
};
