import { useEffect, useRef, useState } from 'react';

/**
 * Throttle a fast-changing value so downstream re-parsing (e.g. WrapperMarkdown
 * re-parses the whole buffer per token) runs at most once per `intervalMs`.
 * The latest value always lands once the stream settles.
 */
export function useThrottledValue<T>(value: T, intervalMs = 120): T {
  const [throttled, setThrottled] = useState(value);
  const lastEmitRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastEmitRef.current;

    if (elapsed >= intervalMs) {
      lastEmitRef.current = now;
      setThrottled(value);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      lastEmitRef.current = Date.now();
      setThrottled(value);
    }, intervalMs - elapsed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, intervalMs]);

  return throttled;
}
