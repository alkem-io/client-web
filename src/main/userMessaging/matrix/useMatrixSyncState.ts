import type { MatrixClient } from 'matrix-js-sdk';
import { useSyncExternalStore } from 'react';
import { CLIENT_SYNC } from './matrixRooms';

const noop = () => {};

/** The client's current sync state; null before its first sync or without a client. */
export const useMatrixSyncState = (client: MatrixClient | null): string | null =>
  useSyncExternalStore(
    listener => {
      if (!client) {
        return noop;
      }
      client.on(CLIENT_SYNC as never, listener as never);
      return () => client.removeListener(CLIENT_SYNC as never, listener as never);
    },
    () => client?.getSyncState() ?? null,
    () => null
  );
