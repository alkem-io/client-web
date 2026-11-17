import { useEffect, useState } from 'react';
import { useMatrixSyncState } from './activeClient';

// The SDK retries its keepalive every 5–10 s once a sync fails, so a blip
// shorter than this recovers before the user is told anything.
export const CONNECTION_LOST_DELAY_MS = 5000;

const isLost = (state: string | null): boolean => state === 'ERROR' || state === 'RECONNECTING';

/** True once the chat sync has stayed in ERROR/RECONNECTING for CONNECTION_LOST_DELAY_MS; false as soon as it recovers. */
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
