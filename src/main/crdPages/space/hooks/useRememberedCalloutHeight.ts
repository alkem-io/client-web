import { useEffect, useRef } from 'react';

/**
 * Remembers the rendered height of each feed callout card (per viewport width) across
 * mounts and full page reloads, so the next time the card is loading its placeholder
 * can reserve exactly the space the card will take (issue #10043 — layout jump).
 *
 * Heights are keyed by `<calloutId>@<viewport width>` — a card's height only holds for
 * the width it was measured at. The store lives in `sessionStorage` (every in-app CRD
 * navigation is a full reload, so an in-memory map alone would rarely survive) with an
 * in-memory mirror, and is best-effort: storage failures fall back to memory only.
 */

const STORAGE_KEY = 'alkemio_callout_heights';
const MAX_ENTRIES = 300;

let heights: Map<string, number> | undefined;

function readStore(): Map<string, number> {
  if (heights) {
    return heights;
  }
  heights = new Map();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      for (const [key, value] of Object.entries(JSON.parse(raw) as Record<string, unknown>)) {
        if (typeof value === 'number') {
          heights.set(key, value);
        }
      }
    }
  } catch {
    // sessionStorage unavailable or corrupt — keep the in-memory map only.
  }
  return heights;
}

function persist(store: Map<string, number>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(store)));
  } catch {
    // Quota / privacy mode — the in-memory map still serves this session.
  }
}

const storageKey = (calloutId: string) => `${calloutId}@${window.innerWidth}`;

export function getRememberedCalloutHeight(calloutId: string): number | undefined {
  return readStore().get(storageKey(calloutId));
}

export function rememberCalloutHeight(calloutId: string, height: number) {
  const store = readStore();
  const key = storageKey(calloutId);
  const rounded = Math.round(height);
  if (rounded <= 0 || store.get(key) === rounded) {
    return;
  }
  // Re-insert so the key moves to the end: Map keeps insertion order, so the
  // oldest entries are the first ones and get evicted first.
  store.delete(key);
  store.set(key, rounded);
  while (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest === undefined) {
      break;
    }
    store.delete(oldest);
  }
  persist(store);
}

/**
 * Returns the remembered height for `calloutId` (if any) as the exact `height` for
 * whichever placeholder stands in for the card — the not-yet-loaded skeleton AND the
 * Suspense fallback shown while the loaded card's subtree is still resolving. Once loaded,
 * attach `ref` to the element wrapping the real card: its height is tracked
 * (ResizeObserver, so late-arriving images and contributions are included) and remembered
 * for the next visit.
 */
export function useRememberedCalloutHeight(calloutId: string, loaded: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!loaded || !element) {
      return;
    }
    const observer = new ResizeObserver(() => rememberCalloutHeight(calloutId, element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, [calloutId, loaded]);

  return { ref, height: getRememberedCalloutHeight(calloutId) };
}
