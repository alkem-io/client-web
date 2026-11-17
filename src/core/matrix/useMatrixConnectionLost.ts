import { useEffect, useState } from 'react';
import { useMatrixSyncState } from './activeClient';

// ERROR means the SDK's own connectivity check (a keepalive to the server) has
// failed, or /sync has failed three times in a row; a blip shorter than this
// delay after that recovers before the user is told anything.
export const CONNECTION_LOST_DELAY_MS = 5000;

// RECONNECTING is not lost: the SDK enters it on any failed /sync, including the
// long-poll connections that drop routinely, and leaves it once its keepalive
// (2–7 s later) succeeds. CATCHUP follows ERROR once the server answers again but
// before a /sync succeeds; it stays "lost" so a stalled catch-up keeps the notice
// and a re-failure does not restart the delay.
const isLost = (state: string | null): boolean => state === 'ERROR' || state === 'CATCHUP';

/** True once the chat sync has stayed in ERROR/CATCHUP for CONNECTION_LOST_DELAY_MS; false as soon as it recovers. */
export const useMatrixConnectionLost = (): boolean => {
  const lost = isLost(useMatrixSyncState());
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!lost) {
      setShown(false);
      return;
    }
    const timer = setTimeout(() => setShown(true), CONNECTION_LOST_DELAY_MS);
    return () => clearTimeout(timer);
  }, [lost]);

  return lost && shown;
};
