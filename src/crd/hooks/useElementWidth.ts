import { useLayoutEffect, useState } from 'react';

/**
 * Reads an element's current width and keeps it updated via `ResizeObserver`.
 *
 * Modelled on `useGridColumnCount` — a callback ref held in state so the effect
 * re-observes across mount/unmount/replace cycles — but with one difference:
 * the FIRST measurement happens synchronously before paint (`useLayoutEffect`
 * reading `getBoundingClientRect().width`), not inside the `ResizeObserver`
 * callback. A card whose available width decides row-vs-stacked layout
 * would otherwise paint stacked for one frame on every wide screen
 * and then jump to the row layout once the observer's first callback fires —
 * the one cost of measuring width instead of using a screen breakpoint.
 *
 * Returns `[width, ref]`. `width` is `undefined` until the element is
 * measured (SSR, first paint before mount, or no `ResizeObserver` support —
 * callers should treat `undefined` as "not yet known", never as zero).
 */
export function useElementWidth(): [number | undefined, (node: HTMLElement | null) => void] {
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [node, setNode] = useState<HTMLElement | null>(null);

  // Synchronous first measurement — before the browser paints — so a wide card
  // never renders its stacked layout for one frame before jumping to the row layout.
  useLayoutEffect(() => {
    if (!node) return;
    setWidth(node.getBoundingClientRect().width);
  }, [node]);

  useLayoutEffect(() => {
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [width, setNode];
}
