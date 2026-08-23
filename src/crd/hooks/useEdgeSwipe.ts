import { useEffect, useRef } from 'react';

type UseEdgeSwipeOptions = {
  /** Attach the listeners only while true (e.g. only below the desktop breakpoint). */
  enabled?: boolean;
};

/** Width of the touch-start zone along the left viewport edge. */
const EDGE_ZONE_PX = 24;
/** Rightward travel needed to count as an open gesture. */
const OPEN_DISTANCE_PX = 48;
/** Vertical drift that cancels the gesture — the user is scrolling, not swiping. */
const MAX_VERTICAL_DRIFT_PX = 36;

/**
 * Fires `onSwipe` when a touch starts inside a narrow zone on the left viewport
 * edge and travels right past a threshold — the native-app "edge swipe opens the
 * drawer" gesture. Progressive enhancement only: mobile browsers (iOS Safari in
 * particular) reserve the left edge for their own history-back gesture and may
 * swallow the touch before it reaches the page, so a visible trigger button must
 * always exist alongside this.
 *
 * Listeners are passive and touch-only — mouse/pen interactions are unaffected.
 */
export function useEdgeSwipe(onSwipe: () => void, { enabled = true }: UseEdgeSwipeOptions = {}) {
  const onSwipeRef = useRef(onSwipe);
  useEffect(() => {
    onSwipeRef.current = onSwipe;
  });

  useEffect(() => {
    if (!enabled) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      if (touch.clientX > EDGE_ZONE_PX) return;
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = Math.abs(touch.clientY - startY);
      if (dy > MAX_VERTICAL_DRIFT_PX && dy > dx) {
        tracking = false;
        return;
      }
      if (dx >= OPEN_DISTANCE_PX && dx > dy) {
        tracking = false;
        onSwipeRef.current();
      }
    };

    const onTouchEnd = () => {
      tracking = false;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [enabled]);
}
