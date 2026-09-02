import { useEffect, useState } from 'react';

/**
 * Re-renders the consumer at a fixed interval so wall-clock-derived UI
 * (e.g. relative timestamps like "2 minutes ago") stays current while the
 * page is open. Returns the current epoch milliseconds; consumers that only
 * need the tick can ignore the value.
 */
export function useNow(intervalMs: number = 30_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
