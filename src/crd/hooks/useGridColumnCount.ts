import { useEffect, useState } from 'react';

/** Sane default when there is no DOM / ResizeObserver (SSR, first paint, tests). */
const DEFAULT_COLUMN_COUNT = 1;

/**
 * Reads the actual number of columns rendered by a CSS grid at runtime.
 *
 * Counts the tracks in the element's computed `grid-template-columns` (which the
 * browser resolves to a concrete list of pixel widths, one per column) and
 * recomputes on resize via a `ResizeObserver`. Works for any column-defining
 * grid, including `repeat(auto-fill, …)` where the count is layout-dependent.
 *
 * Returns a `[columnCount, ref]` tuple. Attach `ref` to the grid element (it is
 * a callback ref, so it re-measures whenever the element mounts, unmounts, or is
 * replaced — e.g. when the grid is conditionally rendered). `columnCount` is
 * `DEFAULT_COLUMN_COUNT` (1) until the element is measured, and when
 * `ResizeObserver` is unavailable.
 */
export function useGridColumnCount(): [number, (node: HTMLElement | null) => void] {
  const [columnCount, setColumnCount] = useState(DEFAULT_COLUMN_COUNT);
  // Track the node as state (set via the callback ref) so the effect re-runs and
  // re-observes when the grid element unmounts and remounts — a plain RefObject
  // never triggers the effect, leaving the new element unobserved.
  const [node, setNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!node || typeof ResizeObserver === 'undefined') return;

    const measure = () => {
      const template = getComputedStyle(node).gridTemplateColumns;
      // `none` (no grid yet) → keep the default. Otherwise the value is a
      // space-separated list of resolved track sizes, one entry per column.
      const tracks = template === 'none' ? [] : template.trim().split(/\s+/).filter(Boolean);
      setColumnCount(tracks.length > 0 ? tracks.length : DEFAULT_COLUMN_COUNT);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [columnCount, setNode];
}

/**
 * Snap a desired visible count down to a whole number of full grid rows, so the
 * last rendered row is never partial while more cards remain to load.
 *
 * - `visibleCount` — how many cards the lazy-load state currently wants to show.
 * - `totalCount` — how many cards match (after filtering).
 * - `columnCount` — the detected number of grid columns.
 *
 * When every matching card already fits within `visibleCount` (nothing left to
 * load), the full set is returned — the final partial row is allowed to show.
 * Otherwise the result is the largest multiple of `columnCount` that is
 * `<= visibleCount`, but never below one full row when at least that many cards
 * exist.
 */
export function snapToFullRows(visibleCount: number, totalCount: number, columnCount: number): number {
  if (columnCount <= 1) return Math.min(visibleCount, totalCount);
  // Everything fits → show all, including any trailing partial row.
  if (visibleCount >= totalCount) return totalCount;
  const snapped = Math.floor(visibleCount / columnCount) * columnCount;
  // Never collapse below a single full row while that many cards exist.
  const atLeastOneRow = Math.min(columnCount, totalCount);
  return Math.max(snapped, atLeastOneRow);
}
