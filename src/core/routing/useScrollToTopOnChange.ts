import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { NavigationState } from './ScrollToTop';

/**
 * Scrolls the window to the top when `value` changes from one defined value to another.
 * For in-page navigation that only touches the query string (tabs, phases), which
 * `ScrollToTop` deliberately ignores. `undefined` means "not resolved yet": the first
 * resolution never scrolls, so deep links and initial loads keep their position.
 * A navigation that carries `keepScroll` never scrolls either.
 */
export function useScrollToTopOnChange(value: string | number | undefined) {
  const { state } = useLocation();
  const keepScroll = (state as NavigationState | undefined | null)?.keepScroll === true;
  const previous = useRef(value);

  useLayoutEffect(() => {
    const prev = previous.current;
    previous.current = value;
    if (prev !== undefined && value !== undefined && prev !== value && !keepScroll) {
      window.scrollTo(0, 0);
    }
  }, [value, keepScroll]);
}
