import type { MatrixClient } from 'matrix-js-sdk';
import { useSyncExternalStore } from 'react';

/**
 * The one syncing Matrix client of this tab, or null while none is
 * established. The session controller is its only writer; read hooks use
 * `useMatrixClient`.
 */
type Listener = () => void;

let current: MatrixClient | null = null;
let establishing = false;
// matrix-js-sdk's SyncState of the active client ('PREPARED', 'SYNCING',
// 'RECONNECTING', 'ERROR', ...); null while no client is syncing.
let syncState: string | null = null;
const listeners = new Set<Listener>();

const setActiveClient = (client: MatrixClient | null): void => {
  if (current === client) {
    return;
  }
  current = client;
  syncState = null;
  for (const listener of listeners) {
    listener();
  }
};

/** True while the session controller is acquiring credentials or restarting; false once it is synced, stopped or gave up. */
const setSessionEstablishing = (value: boolean): void => {
  if (establishing === value) {
    return;
  }
  establishing = value;
  for (const listener of listeners) {
    listener();
  }
};

/** Written by the session controller from the active client's sync event. */
const setSyncState = (value: string | null): void => {
  if (syncState === value) {
    return;
  }
  syncState = value;
  for (const listener of listeners) {
    listener();
  }
};

const getSyncState = (): string | null => syncState;

const isSessionEstablishing = (): boolean => establishing;

const getActiveClient = (): MatrixClient | null => current;

const subscribeActiveClient = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const useMatrixClient = (): MatrixClient | null =>
  useSyncExternalStore(subscribeActiveClient, getActiveClient, () => null);

const useMatrixSessionEstablishing = (): boolean =>
  useSyncExternalStore(subscribeActiveClient, isSessionEstablishing, () => false);

const useMatrixSyncState = (): string | null => useSyncExternalStore(subscribeActiveClient, getSyncState, () => null);

export {
  getSyncState,
  setSyncState,
  useMatrixSyncState,
  getActiveClient,
  isSessionEstablishing,
  setActiveClient,
  setSessionEstablishing,
  subscribeActiveClient,
  useMatrixClient,
  useMatrixSessionEstablishing,
};
