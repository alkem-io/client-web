import { type PointerEvent as ReactPointerEvent, useRef } from 'react';

/**
 * Enables click-and-drag horizontal scrolling on an overflowing scroll
 * container (e.g. a horizontally scrollable tab strip). Wheel, touch and
 * keyboard scrolling keep working as before — this only adds a pointer-drag
 * affordance for users without a touchpad / horizontal wheel.
 *
 * Usage:
 * ```tsx
 * const drag = useDragScroll<HTMLUListElement>();
 * <ul ref={drag.ref} onPointerDown={drag.onPointerDown} className="overflow-x-auto cursor-grab">
 * ```
 *
 * UI-only: no application state, no side effects beyond the transient drag.
 * A click that immediately follows a real drag is swallowed (capture phase) so
 * dragging across a tab doesn't also activate it.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const onPointerDown = (e: ReactPointerEvent<T>) => {
    // Primary button only; ignore when there's nothing to scroll.
    if (e.button !== 0) return;
    const el = ref.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;

    const startX = e.clientX;
    const startScroll = el.scrollLeft;
    let dragging = false;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      // Small threshold so a plain click on a tab is not treated as a drag.
      if (!dragging && Math.abs(dx) > 4) {
        dragging = true;
        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';
      }
      if (dragging) {
        el.scrollLeft = startScroll - dx;
      }
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.style.cursor = '';
      el.style.userSelect = '';
      if (!dragging) return;
      // Suppress the click that fires after a drag so it doesn't activate the
      // tab the pointer happened to be released over.
      const swallow = (ce: MouseEvent) => {
        ce.stopPropagation();
        ce.preventDefault();
        el.removeEventListener('click', swallow, true);
      };
      el.addEventListener('click', swallow, true);
      // Fallback cleanup if no click follows (e.g. released off the element).
      setTimeout(() => el.removeEventListener('click', swallow, true), 0);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return { ref, onPointerDown };
}
