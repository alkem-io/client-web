import { useEffect, useState } from 'react';

type DebounceOptions<T> = {
  /**
   * When it returns true for the current `value`, that value is applied
   * synchronously instead of waiting out the delay, and it also replaces the
   * pending debounced value. Use it for "clear" states (an empty search
   * field) so a clear never lags — and so a value typed right after the
   * clear, inside the delay window, can never resurrect the pre-clear value.
   */
  immediate?: (value: T) => boolean;
};

/**
 * Returns a debounced copy of `value` that only updates after `delayMs` of
 * quiet. Used to throttle search-driven queries (e.g. account / user pickers)
 * so they don't fire on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 400, options?: DebounceOptions<T>): T {
  const [debounced, setDebounced] = useState(value);
  const applyNow = options?.immediate?.(value) ?? false;

  useEffect(() => {
    if (applyNow) {
      // Sync the stored value too: without this, the next non-immediate value
      // would start its timer while `debounced` still holds the pre-clear
      // value, and that stale value would be what callers read until the
      // timer fires.
      setDebounced(value);
      return;
    }
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs, applyNow]);

  return applyNow ? value : debounced;
}
