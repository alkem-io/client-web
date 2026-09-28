import type { MatrixClient } from 'matrix-js-sdk';
import { useSyncExternalStore } from 'react';

/**
 * The one syncing Matrix client of this tab, or null while none is
 * established. The session controller is its only writer; read hooks use
 * `useMatrixClient`.
 */
type Listener = () => void;

let current: MatrixClient | null = null;
const listeners = new Set<Listener>();

const setActiveClient = (client: MatrixClient | null): void => {
  if (current === client) {
    return;
  }
  current = client;
  for (const listener of listeners) {
    listener();
  }
};

const getActiveClient = (): MatrixClient | null => current;

const subscribeActiveClient = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const useMatrixClient = (): MatrixClient | null =>
  useSyncExternalStore(subscribeActiveClient, getActiveClient, () => null);

export { getActiveClient, setActiveClient, subscribeActiveClient, useMatrixClient };
