import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Remembers the rendered height of each feed callout card across mounts and full page
 * reloads, so the next time the card is loading its placeholder can reserve exactly the
 * space the card will take (issue #10043 — layout jump).
 *
 * Heights are keyed by `<calloutId>@<variant>@<column width bucket>`: a card's height only
 * holds for the width it wraps at — the feed column's, which changes with the viewport AND
 * with the sidebar being shown or not — and for the rendering variant (the same callout is
 * taller in the normal feed than forced-collapsed in search results). One `sessionStorage`
 * entry per key (per tab, dies with it; every in-app CRD navigation is a full reload, so
 * memory alone would rarely survive). Best-effort: storage failures are ignored.
 */

const KEY_PREFIX = 'alkemio_callout_height:';
/** Widths are bucketed so a resize drag doesn't leave one entry per intermediate width. */
const WIDTH_BUCKET_PX = 40;

const storageKey = (calloutId: string, variant: string, columnWidth: number) =>
  `${KEY_PREFIX}${calloutId}@${variant}@${Math.round(columnWidth / WIDTH_BUCKET_PX)}`;

export function getRememberedCalloutHeight(calloutId: string, variant: string, columnWidth: number) {
  try {
    const height = Number(sessionStorage.getItem(storageKey(calloutId, variant, columnWidth)));
    return height > 0 ? height : undefined;
  } catch {
    return undefined;
  }
}

export function rememberCalloutHeight(calloutId: string, variant: string, columnWidth: number, height: number) {
  const rounded = Math.round(height);
  if (rounded <= 0) {
    return;
  }
  try {
    sessionStorage.setItem(storageKey(calloutId, variant, columnWidth), String(rounded));
  } catch {
    // Quota / privacy mode — the placeholder falls back to its shape-based guess.
  }
}

type UseRememberedCalloutHeightParams = {
  calloutId: string;
  /** Distinguishes renderings of the same callout that differ in height at the same width. */
  variant: string;
  /**
   * True while the card is in a transient state its next mount won't reproduce (inline
   * comments opened, description expanded by the viewer) — the height is not recorded then,
   * so the placeholder keeps matching the card as it mounts. Re-measured when it turns false.
   */
  paused?: boolean;
};

/**
 * Returns the remembered height for the card (if any) as the exact `height` for whichever
 * placeholder stands in for it — the not-yet-loaded skeleton AND the Suspense fallback shown
 * while the loaded card's subtree is still resolving — plus two refs:
 * - `columnRef` goes on the always-mounted wrapper (placeholder or card) — its width is the
 *   width the card wraps at, and part of the key.
 * - `ref` goes on the element wrapping the real card once it has mounted: its height is
 *   tracked (ResizeObserver, so late-arriving images and contributions are included) and
 *   remembered for the next visit. It is a callback with cleanup, so it only ever observes
 *   the mounted card — never the Suspense fallback that precedes it — and is created once
 *   per mount: the observer reads the latest params through a ref instead of being torn
 *   down and rebuilt on every re-render.
 */
export function useRememberedCalloutHeight({ calloutId, variant, paused = false }: UseRememberedCalloutHeightParams) {
  const columnElementRef = useRef<HTMLDivElement | null>(null);
  const contentElementRef = useRef<HTMLDivElement | null>(null);
  const [columnWidth, setColumnWidth] = useState<number>();

  // A callback (not the ref object) so the consumer can compose it with its own ref.
  const columnRef = (element: HTMLDivElement | null) => {
    columnElementRef.current = element;
  };

  const latest = useRef({ calloutId, variant, paused });
  useEffect(() => {
    latest.current = { calloutId, variant, paused };
  });

  // Measured synchronously so the placeholder has its height before the first paint;
  // the observer follows later width changes (viewport resize, sidebar shown / hidden).
  useLayoutEffect(() => {
    const column = columnElementRef.current;
    if (!column) {
      return;
    }
    setColumnWidth(column.clientWidth);
    const observer = new ResizeObserver(() => setColumnWidth(column.clientWidth));
    observer.observe(column);
    return () => observer.disconnect();
  }, []);

  const record = (element: HTMLDivElement) => {
    const current = latest.current;
    if (!current.paused) {
      rememberCalloutHeight(current.calloutId, current.variant, element.clientWidth, element.offsetHeight);
    }
  };

  // Growth while paused (a "Read more") is skipped; record the settled state once unpaused.
  useEffect(() => {
    const element = contentElementRef.current;
    if (!paused && element) {
      record(element);
    }
  }, [paused]);

  const ref = (element: HTMLDivElement | null) => {
    contentElementRef.current = element;
    if (!element) {
      return;
    }
    // Written on every notification (the width bucket already absorbs a resize drag's key
    // churn): every CRD navigation is a full reload, so a deferred write would be lost
    // whenever the user leaves within the delay.
    const observer = new ResizeObserver(() => record(element));
    observer.observe(element);
    return () => {
      observer.disconnect();
      contentElementRef.current = null;
    };
  };

  return {
    columnRef,
    ref,
    height: columnWidth === undefined ? undefined : getRememberedCalloutHeight(calloutId, variant, columnWidth),
  };
}
